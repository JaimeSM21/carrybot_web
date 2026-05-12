from fastapi import APIRouter
from pydantic import BaseModel
from api.database import fetch_query, execute_query

router = APIRouter(prefix="/incidencias", tags=["incidencias"])

class EstadoUpdate(BaseModel):
    estado: str

@router.get("/")
def listar_incidencias():
    return fetch_query("""
        SELECT 
            id,
            id_robot,
            asunto,
            cuerpo,
            estado,
            fecha_apertura
        FROM incidencias
    """)

@router.put("/{id}/estado")
def cambiar_estado(id: int, data: EstadoUpdate):
    execute_query(
        "UPDATE incidencias SET estado = %s WHERE id = %s",
        (data.estado, id)
    )
    return {"message": "Estado actualizado"}