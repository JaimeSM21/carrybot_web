from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from api.database import fetch_query, execute_query
from api.auth import get_current_user, require_admin

router = APIRouter(prefix="/alertas", tags=["alertas"])

class EstadoUpdate(BaseModel):
    estado: str


@router.get("/")
def listar_alertas(current_user: dict = Depends(require_admin)):
    """Solo administradores ven todas las alertas."""
    return fetch_query("""
        SELECT
            a.id,
            DATE_FORMAT(a.fecha_creacion, '%d %M %Y') AS fecha,
            DATE_FORMAT(a.fecha_creacion, '%H:%i') AS hora,
            a.id_robot,
            r.codigo AS robot_codigo,
            u.nombre AS trabajador,
            a.descripcion,
            a.estado
        FROM alertas a
        JOIN robots r ON a.id_robot = r.id
        JOIN usuarios u ON a.id_trabajador = u.id
        ORDER BY a.fecha_creacion DESC
    """)


@router.get("/usuario/{trabajador_id}")
def listar_alertas_usuario(trabajador_id: int, current_user: dict = Depends(get_current_user)):
    """Un trabajador solo puede ver sus propias alertas."""
    if current_user['tipo'] != 'administrador' and current_user['id'] != trabajador_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="No puedes ver alertas de otro usuario.")

    return fetch_query("""
        SELECT
            a.id,
            DATE_FORMAT(a.fecha_creacion, '%d %M %Y') AS fecha,
            DATE_FORMAT(a.fecha_creacion, '%H:%i') AS hora,
            a.id_robot,
            r.codigo AS robot_codigo,
            a.descripcion,
            CASE
                WHEN a.estado = 'pendiente' THEN 'Pendiente'
                WHEN a.estado = 'atendida' THEN 'Atendida'
                WHEN a.estado = 'resuelta' THEN 'Resuelta'
                ELSE a.estado
            END AS estado
        FROM alertas a
        JOIN robots r ON a.id_robot = r.id
        WHERE a.id_trabajador = %s
        ORDER BY a.fecha_creacion DESC
    """, (trabajador_id,))


@router.put("/{id}/estado")
def cambiar_estado(id: int, data: EstadoUpdate, current_user: dict = Depends(get_current_user)):
    # Verificar que la alerta pertenece al trabajador (o es admin)
    if current_user['tipo'] != 'administrador':
        alerta = fetch_query("SELECT id_trabajador FROM alertas WHERE id = %s", (id,))
        if not alerta or alerta[0]['id_trabajador'] != current_user['id']:
            raise HTTPException(status_code=403, detail="No puedes modificar alertas de otro trabajador.")

    estado_bbdd = {
        "Pendiente": "pendiente",
        "Atendida": "atendida",
        "Resuelta": "resuelta"
    }.get(data.estado, "pendiente")

    execute_query(
        "UPDATE alertas SET estado = %s, fecha_resolucion = NOW() WHERE id = %s",
        (estado_bbdd, id)
    )
    return {"message": "Estado actualizado"}