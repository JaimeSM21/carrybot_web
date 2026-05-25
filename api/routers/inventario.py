from fastapi import APIRouter, HTTPException
from api.database import fetch_query, execute_query
from datetime import datetime

router = APIRouter(prefix="/inventario", tags=["inventario"])

@router.get("/")
def get_inventario():
   
    sql = """
        SELECT p.id, p.codigo_barras, p.descripcion, p.peso_kg, p.estado, 
               e.codigo AS estanteria, s.nombre_sector AS sector
        FROM paquetes p
        LEFT JOIN estanterias e ON p.id_estanteria = e.id
        LEFT JOIN sectores s ON e.id_sector = s.id
    """
    return fetch_query(sql)

@router.post("/add")
async def add_producto(item: dict):
    try:
        
        sql = """
            INSERT INTO paquetes (codigo_barras, descripcion, peso_kg, id_estanteria, estado, fecha_entrada, fecha_salida)
            VALUES (%s, %s, %s, %s, 'almacenado', %s, %s)
        """
        
        ahora = datetime.now()
        params = (
            item['codigo_barras'], 
            item['descripcion'], 
            float(item['peso_kg']), 
            int(item['id_estanteria']), 
            ahora,
            ahora 
        )
        execute_query(sql, params)
        return {"status": "success", "message": "Producto guardado correctamente"}
    except Exception as e:
        print(f"Error en BBDD: {e}")
        raise HTTPException(status_code=500, detail="No se pudo guardar el producto")
