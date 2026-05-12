from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.database import fetch_query, execute_query
from datetime import datetime
import json

router = APIRouter(prefix="/tareas", tags=["tareas"])


class TareaCreate(BaseModel):
    id_robot: int
    destino_nombre: str   # p.ej. "Estanteria1"
    destino_x: float
    destino_y: float
    qr_data: str          # JSON crudo del QR


@router.post("/")
def crear_tarea(tarea: TareaCreate):
    """
    Crea una tarea nueva en estado 'pendiente'.
    Se llama en cuanto se lee el QR y antes de que el robot se mueva.
    """
    destino_json = json.dumps({
        "nombre": tarea.destino_nombre,
        "x": tarea.destino_x,
        "y": tarea.destino_y
    })
    # origen vacío: no conocemos la estantería origen en el simulador
    origen_json = json.dumps({"nombre": "desconocido"})

    cursor = execute_query(
        """
        INSERT INTO tareas
          (id_robot, id_paquete, origen, destino, estado, fecha_creacion, fecha_resolucion)
        VALUES (%s, 1, %s, %s, 'pendiente', %s, %s)
        """,
        (tarea.id_robot, origen_json, destino_json,
         datetime.now(), datetime.now())
    )
    if not cursor:
        raise HTTPException(status_code=500, detail="Error al crear la tarea")

    return {"id": cursor.lastrowid, "estado": "pendiente"}


@router.put("/{tarea_id}/estado")
def actualizar_estado(tarea_id: int, estado: str):
    """
    Actualiza el estado de una tarea.
    Estados válidos: pendiente, en_curso, completada, cancelada.
    """
    estados_validos = {"pendiente", "en_curso", "completada", "cancelada"}
    if estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado no válido: {estado}")

    execute_query(
        "UPDATE tareas SET estado = %s, fecha_resolucion = %s WHERE id = %s",
        (estado, datetime.now(), tarea_id)
    )
    return {"ok": True, "tarea_id": tarea_id, "estado": estado}


@router.get("/robot/{robot_id}")
def get_tareas_robot(robot_id: int):
    """Devuelve las últimas 10 tareas del robot para mostrar historial."""
    return fetch_query(
        "SELECT id, destino, estado, fecha_creacion, fecha_resolucion "
        "FROM tareas WHERE id_robot = %s "
        "ORDER BY fecha_creacion DESC LIMIT 10",
        (robot_id,)
    )