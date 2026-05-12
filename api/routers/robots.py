import json
from fastapi import APIRouter
from api.database import fetch_query

router = APIRouter(prefix="/robots", tags=["robots"])

@router.get("/")
def get_robots():
    # 1. Traemos los datos de XAMPP
    query = "SELECT * FROM robots"
    db_data = fetch_query(query)
    
    # 📝 IMPORTANTE: Mira tu terminal de Uvicorn después de refrescar la web.
    # Verás exactamente qué está saliendo de la base de datos.
    print(f"--- DATOS REALES DE XAMPP: {db_data} ---")
    
    resultado = []
    
    for fila in db_data:
        # CASO A: Los datos vienen como Diccionario (con nombres)
        if isinstance(fila, dict):
            # Limpiamos las llaves por si hay espacios o mayúsculas
            f = {str(k).lower().strip(): v for k, v in fila.items()}
            res = {
                "id": f.get('id'),
                "codigo": f.get('codigo') or f.get('nombre') or "Sin Código",
                "modelo": f.get('modelo') or "Carrybot v1",
                "estado": f.get('estado') or "desconectado",
                "bateria": f.get('bateria_pct') or 0
            }
        
        # CASO B: Los datos vienen como Tupla (sin nombres, solo orden)
        else:
            # Según tu tabla: 0:id, 1:codigo, 2:modelo, 3:estado, 4:bateria_pct
            res = {
                "id": fila[0],
                "codigo": str(fila[1]) if len(fila) > 1 else "Error-ID",
                "modelo": str(fila[2]) if len(fila) > 2 else "Modelo-X",
                "estado": str(fila[3]) if len(fila) > 3 else "off",
                "bateria": fila[4] if len(fila) > 4 else 0
            }
            
        resultado.append(res)
    
    return resultado

@router.get("/{robot_id}")
def get_robot_by_id(robot_id: int):
    query = f"SELECT * FROM robots WHERE id = {robot_id}"
    db_data = fetch_query(query)
    if not db_data:
        return {"error": "No existe"}
    
    fila = db_data[0]
    if isinstance(fila, dict):
        f = {str(k).lower().strip(): v for k, v in fila.items()}
        return {
            "id": f.get('id'),
            "codigo": f.get('codigo') or f.get('nombre') or "Sin Código",
            "modelo": f.get('modelo') or "Carrybot v1",
            "estado": f.get('estado') or "desconectado",
            "bateria": f.get('bateria_pct') or 0
        }
    else:
        return {
            "id": fila[0],
            "codigo": str(fila[1]),
            "modelo": str(fila[2]),
            "estado": str(fila[3]),
            "bateria": fila[4]
        }