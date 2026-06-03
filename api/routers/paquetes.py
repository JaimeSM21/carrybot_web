from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.database import fetch_query, execute_query
from datetime import datetime

router = APIRouter(prefix="/paquetes", tags=["paquetes"])


class PaqueteDetectado(BaseModel):
    codigo_barras: str    # id del JSON del paquete, p.ej. "PKG-001"
    dest: str             # destino detectado, p.ej. "Estanteria1"
    id_robot: int = 1
    id_trabajador: int = 1


@router.post("/detectado")
def paquete_detectado(body: PaqueteDetectado):
    """
    Endpoint llamado desde GestionRobot cuando la cámara detecta un paquete.

    1. Busca el paquete por codigo_barras en la tabla paquetes.
    2. Si existe, lo elimina.
    3. Crea una alerta de tipo 'cargar' en la tabla alertas.

    Returns:
        Dict con el resultado de la operación.
    """
    # 1. Buscar el paquete
    rows = fetch_query(
        "SELECT id, descripcion FROM paquetes WHERE codigo_barras = %s",
        (body.codigo_barras,)
    )

    paquete_eliminado = False

    if rows:
        paquete_id = rows[0]["id"]
        descripcion = rows[0]["descripcion"]

        # 2. Eliminar el paquete
        execute_query(
            "DELETE FROM paquetes WHERE id = %s",
            (paquete_id,)
        )
        paquete_eliminado = True
    else:
        descripcion = body.codigo_barras

    # 3. Crear alerta tipo 'cargar' independientemente de si existía el paquete
    desc_alerta = (
        f"Paquete {body.codigo_barras} detectado por cámara. "
        f"Destino: {body.dest}. Listo para cargar."
    )
    execute_query(
        """
        INSERT INTO alertas
          (id_robot, id_trabajador, tipo, descripcion,
           estado, fecha_creacion, fecha_resolucion)
        VALUES (%s, %s, 'cargar', %s, 'pendiente', %s, %s)
        """,
        (body.id_robot, body.id_trabajador, desc_alerta,
         datetime.now(), datetime.now())
    )

    return {
        "ok": True,
        "paquete_eliminado": paquete_eliminado,
        "codigo_barras": body.codigo_barras,
        "alerta_creada": True,
    }