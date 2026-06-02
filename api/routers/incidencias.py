from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from datetime import datetime
from api.database import fetch_query, execute_query
from api.auth import get_current_user, require_admin

router = APIRouter(prefix="/incidencias", tags=["incidencias"])


# ── Modelos ──────────────────────────────────────────────────────────────────

class EstadoUpdate(BaseModel):
    estado: str

class IncidenciaCrear(BaseModel):
    id_trabajador: int | None = None
    id_robot: int | None = None
    asunto: str | None = None
    cuerpo: str | None = None
    # Campos legacy por compatibilidad
    robot_id: int | None = None
    descripcion: str | None = None
    gravedad: str | None = None


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/")
def listar_incidencias(current_user: dict = Depends(require_admin)):
    """Solo administradores ven todas las incidencias."""
    return fetch_query("""
        SELECT id, id_trabajador, id_robot, asunto, cuerpo, estado, fecha_apertura 
        FROM incidencias
        ORDER BY fecha_apertura DESC
    """)


@router.get("/robots-asignados/{id_trabajador}")
def listar_robots_asignados(id_trabajador: int, current_user: dict = Depends(get_current_user)):
    """
    Admin → todos los robots.
    Trabajador → solo sus robots asignados (y solo los suyos propios).
    """
    if current_user['tipo'] != 'administrador' and current_user['id'] != id_trabajador:
        raise HTTPException(status_code=403, detail="No puedes consultar robots de otro usuario.")

    if current_user['tipo'] == 'administrador':
        return fetch_query("SELECT id, codigo, modelo, estado FROM robots")
    else:
        return fetch_query("""
            SELECT r.id, r.codigo, r.modelo, r.estado 
            FROM robots r
            INNER JOIN trabajador_robot tr ON r.id = tr.id_robot
            WHERE tr.id_trabajador = %s
        """, (id_trabajador,))


@router.post("/")
def crear_incidencia(incidencia: IncidenciaCrear, current_user: dict = Depends(get_current_user)):
    """Cualquier usuario logueado puede crear una incidencia, pero solo sobre sí mismo."""
    try:
        # El trabajador solo puede crear incidencias en su propio nombre
        id_usuario_final = incidencia.id_trabajador or current_user['id']
        if current_user['tipo'] != 'administrador' and id_usuario_final != current_user['id']:
            raise HTTPException(status_code=403, detail="No puedes crear incidencias en nombre de otro usuario.")

        # Buscar un administrador para asignar
        admins = fetch_query("SELECT id FROM usuarios WHERE tipo = 'administrador' LIMIT 1")
        id_admin_final = admins[0]['id'] if admins else id_usuario_final

        # Compatibilidad con campos legacy
        id_robot_final = incidencia.id_robot or incidencia.robot_id
        asunto_final = incidencia.asunto or f"Fallo [{incidencia.gravedad or 'MEDIA'}]"
        cuerpo_final = incidencia.cuerpo or incidencia.descripcion or "Sin descripción."

        execute_query("""
            INSERT INTO incidencias (id_trabajador, id_administrador, id_robot, asunto, cuerpo, estado, fecha_apertura)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (id_usuario_final, id_admin_final, id_robot_final, asunto_final, cuerpo_final, "abierta", datetime.now()))

        return {"ok": True, "message": "Guardado correctamente"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en MySQL: {str(e)}")


@router.put("/{id}/estado")
def cambiar_estado(id: int, data: EstadoUpdate, current_user: dict = Depends(require_admin)):
    """Solo administradores pueden cambiar el estado de una incidencia."""
    execute_query(
        "UPDATE incidencias SET estado = %s WHERE id = %s",
        (data.estado, id)
    )
    return {"message": "Estado actualizado"}