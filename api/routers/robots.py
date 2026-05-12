from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.database import fetch_query, execute_query
import json
from datetime import datetime

router = APIRouter(prefix="/robots", tags=["robots"])


class PosicionUpdate(BaseModel):
    x: float
    y: float
    z: float = 0.0


@router.get("/{robot_id}")
def get_robot(robot_id: int):
    """Devuelve los datos del robot para mostrarlos en GestionRobot."""
    rows = fetch_query(
        "SELECT id, codigo, modelo, estado, bateria_pct, posicion, ultima_conexion "
        "FROM robots WHERE id = %s",
        (robot_id,)
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Robot no encontrado")
    return rows[0]


@router.put("/{robot_id}/posicion")
def update_posicion(robot_id: int, pos: PosicionUpdate):
    """Actualiza la posición y la última conexión del robot."""
    posicion_json = json.dumps({"x": pos.x, "y": pos.y, "z": pos.z})
    execute_query(
        "UPDATE robots SET posicion = %s, ultima_conexion = %s WHERE id = %s",
        (posicion_json, datetime.now(), robot_id)
    )
    return {"ok": True}


@router.put("/{robot_id}/estado")
def update_estado(robot_id: int, estado: str):
    """Actualiza el estado del robot (activo, en_tarea, error, inactivo)."""
    estados_validos = {"activo", "inactivo", "en_tarea", "error"}
    if estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado no válido: {estado}")
    execute_query(
        "UPDATE robots SET estado = %s WHERE id = %s",
        (estado, robot_id)
    )
    return {"ok": True}