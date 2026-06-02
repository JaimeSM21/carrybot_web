from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from api.database import fetch_query, execute_query
from api.auth import get_current_user, require_admin
import json
from datetime import datetime

router = APIRouter(prefix="/robots", tags=["robots"])


class PosicionUpdate(BaseModel):
    x: float
    y: float
    z: float = 0.0


@router.get("/")
def get_robots(current_user: dict = Depends(get_current_user)):
    """Cualquier usuario logueado puede ver la lista de robots."""
    db_data = fetch_query("SELECT * FROM robots")
    if not db_data:
        return []

    resultado = []
    for fila in db_data:
        v = list(fila.values()) if isinstance(fila, dict) else list(fila)
        try:
            res = {
                "id": v[0],
                "codigo": str(v[1]) if len(v) > 1 else f"CB-{v[0]}",
                "modelo": str(v[2]) if len(v) > 2 else "Carrybot v1",
                "estado": str(v[3]) if len(v) > 3 else "desconectado",
                "bateria": v[4] if len(v) > 4 and v[4] is not None else 0,
                "ubicacion": "Almacén Central",
                "posicion": {"x": 0, "y": 0, "z": 0}
            }
            for item in v:
                if isinstance(item, str) and '{"x":' in item:
                    try: res['posicion'] = json.loads(item)
                    except: pass
            resultado.append(res)
        except Exception as e:
            print(f"Error procesando robot: {e}")

    return resultado


@router.get("/{robot_id}")
def get_robot(robot_id: int, current_user: dict = Depends(get_current_user)):
    """Cualquier usuario logueado puede ver un robot por ID."""
    rows = fetch_query("SELECT * FROM robots WHERE id = %s", (robot_id,))
    if not rows:
        raise HTTPException(status_code=404, detail="Robot no encontrado en la base de datos")

    v = list(rows[0].values()) if isinstance(rows[0], dict) else list(rows[0])
    robot_data = {
        "id": v[0],
        "codigo": v[1] if len(v) > 1 else f"CB-{v[0]}",
        "modelo": v[2] if len(v) > 2 else "V1",
        "estado": v[3] if len(v) > 3 else "off",
        "bateria": v[4] if len(v) > 4 else 0,
        "posicion": {"x": 0, "y": 0, "z": 0}
    }
    for item in v:
        if isinstance(item, str) and '{"x":' in item:
            try: robot_data['posicion'] = json.loads(item)
            except: pass

    return robot_data


@router.put("/{robot_id}/posicion")
def update_posicion(robot_id: int, pos: PosicionUpdate, current_user: dict = Depends(get_current_user)):
    posicion_json = json.dumps({"x": pos.x, "y": pos.y, "z": pos.z})
    execute_query(
        "UPDATE robots SET posicion = %s, ultima_conexion = %s WHERE id = %s",
        (posicion_json, datetime.now(), robot_id)
    )
    return {"ok": True}


@router.put("/{robot_id}/estado")
def update_estado(robot_id: int, estado: str, current_user: dict = Depends(get_current_user)):
    estados_validos = {"activo", "inactivo", "en_tarea", "error"}
    if estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado no válido: {estado}")
    execute_query("UPDATE robots SET estado = %s WHERE id = %s", (estado, robot_id))
    return {"ok": True}