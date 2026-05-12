import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from api.database import fetch_query, execute_query

router = APIRouter(prefix="/robots", tags=["robots"])

# Modelo para la actualización de posición (Requerido por el equipo)
class PosicionUpdate(BaseModel):
    x: float
    y: float
    z: float = 0.0

@router.get("/")
def get_robots():
    """
    Lista de robots con buscador automático de columnas (Lógica de Rocío).
    Evita errores si los nombres de columnas en XAMPP varían.
    """
    query = "SELECT * FROM robots"
    db_data = fetch_query(query)
    
    if not db_data:
        return []
    
    resultado = []
    for fila in db_data:
        # Normalizamos la fila (ya sea diccionario o tupla)
        valores = list(fila.values()) if isinstance(fila, dict) else list(fila)
        
        try:
            res = {
                "id": valores[0],
                "codigo": str(valores[1]) if len(valores) > 1 else f"CB-{valores[0]}",
                "modelo": str(valores[2]) if len(valores) > 2 else "Carrybot v1",
                "estado": str(valores[3]) if len(valores) > 3 else "desconectado",
                "bateria": valores[4] if len(valores) > 4 and valores[4] is not None else 0,
                "ubicacion": "Almacén Central"
            }
            
            # Buscamos el JSON de posición en cualquier columna (por si acaso)
            res['posicion'] = {"x": 0, "y": 0, "z": 0}
            for v in valores:
                if isinstance(v, str) and '{"x":' in v:
                    try: res['posicion'] = json.loads(v)
                    except: pass
            
            resultado.append(res)
        except Exception as e:
            print(f"Error procesando robot: {e}")

    return resultado

@router.get("/{robot_id}")
def get_robot(robot_id: int):
    """
    Devuelve los datos de un robot específico (Lógica de Release).
    """
    rows = fetch_query(
        "SELECT id, codigo, modelo, estado, bateria, posicion, ultima_conexion FROM robots WHERE id = %s",
        (robot_id,)
    )
    if not rows:
        raise HTTPException(status_code=404, detail="Robot no encontrado")
    
    # Intentamos parsear la posición si viene como string
    robot = dict(rows[0])
    if isinstance(robot.get('posicion'), str):
        try: robot['posicion'] = json.loads(robot['posicion'])
        except: robot['posicion'] = {"x":0, "y":0, "z":0}
        
    return robot

@router.put("/{robot_id}/posicion")
def update_posicion(robot_id: int, pos: PosicionUpdate):
    """
    Actualiza la posición y la última conexión (Lógica de Release).
    """
    posicion_json = json.dumps({"x": pos.x, "y": pos.y, "z": pos.z})
    execute_query(
        "UPDATE robots SET posicion = %s, ultima_conexion = %s WHERE id = %s",
        (posicion_json, datetime.now(), robot_id)
    )
    return {"ok": True}

@router.put("/{robot_id}/estado")
def update_estado(robot_id: int, estado: str):
    """
    Actualiza el estado del robot (Lógica de Release).
    """
    estados_validos = {"activo", "inactivo", "en_tarea", "error"}
    if estado not in estados_validos:
        raise HTTPException(status_code=400, detail=f"Estado no válido: {estado}")
    
    execute_query(
        "UPDATE robots SET estado = %s WHERE id = %s",
        (estado, robot_id)
    )
    return {"ok": True}