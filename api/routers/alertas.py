from fastapi import APIRouter
from pydantic import BaseModel
from api.database import fetch_query, execute_query

router = APIRouter(prefix="/alertas", tags=["alertas"])

class EstadoUpdate(BaseModel):
    estado: str

@router.get("/")
def listar_alertas():
    return fetch_query("""
        SELECT
            a.id,
            DATE_FORMAT(a.fecha_creacion, '%d %M %Y') AS fecha,
            DATE_FORMAT(a.fecha_creacion, '%H:%i') AS hora,
            a.id_robot,
            r.codigo AS robot_codigo,
            u.nombre AS trabajador,
            a.descripcion,
            CASE
                WHEN a.estado = 'pendiente' THEN 'Pendiente'
                WHEN a.estado = 'atendida' THEN 'Atendida'
                WHEN a.estado = 'resuelta' THEN 'Resuelta'
                ELSE a.estado
            END AS estado
        FROM alertas a
        JOIN robots r ON a.id_robot = r.id
        JOIN usuarios u ON a.id_trabajador = u.id
        ORDER BY a.fecha_creacion DESC
    """)

@router.put("/{id}/estado")
def cambiar_estado(id: int, data: EstadoUpdate):
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