from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from api.database import fetch_query, execute_query

router = APIRouter(prefix="/incidencias", tags=["incidencias"])

# --- MODELOS DE DATOS ---

class EstadoUpdate(BaseModel):
    estado: str

# Modelo ultra-flexible y tolerante a fallos: acepta todo tipo de payloads
class IncidenciaCrear(BaseModel):
    # Formato antiguo
    robot_id: int | None = None
    descripcion: str | None = None
    gravedad: str | None = None
    operario: str | None = None

    # Formato phpMyAdmin real
    id_trabajador: int | None = None
    id_robot: int | None = None
    asunto: str | None = None
    cuerpo: str | None = None


# --- ENDPOINTS ---

@router.get("/")
def listar_incidencias():
    return fetch_query("""
        SELECT id, id_robot, asunto, cuerpo, estado, fecha_apertura 
        FROM incidencias
    """)


@router.post("/")
def crear_incidencia(incidencia: IncidenciaCrear):
    # 🕵️ TRUCO DE DEPURACIÓN: Esto imprimirá en tu terminal negra de Windows lo que está llegando de React
    print("\n📥 --- INCIDENCIA RECIBIDA EN BACKEND ---")
    print(f"Datos crudos: {incidencia.model_dump()}")
    
    try:
        # 1. Ajustar el id_trabajador (Evita el fallo de clave foránea 'incidencias_ibfk_1')
        id_usuario_final = incidencia.id_trabajador
        if id_usuario_final:
            check_user = fetch_query("SELECT id FROM usuarios WHERE id = %s", (id_usuario_final,))
            if not check_user:
                id_usuario_final = None

        # Si sigue siendo nulo o no existe, cogemos el primer usuario de tu phpMyAdmin
        if not id_usuario_final:
            usuarios_sistema = fetch_query("SELECT id FROM usuarios LIMIT 1")
            if usuarios_sistema:
                id_usuario_final = usuarios_sistema[0]['id'] if isinstance(usuarios_sistema[0], dict) else usuarios_sistema[0][0]
            else:
                id_usuario_final = 1 # Fallback extremo

        # 2. RESOLVER EL ADMINISTRADOR (Evita el fallo de clave foránea 'incidencias_ibfk_2' 🌟)
        id_admin_final = None
        # Buscamos un administrador real en la tabla usuarios de phpMyAdmin
        admins = fetch_query("SELECT id FROM usuarios WHERE tipo = 'administrador' LIMIT 1")
        if admins:
            id_admin_final = admins[0]['id'] if isinstance(admins[0], dict) else admins[0][0]
        else:
            # Si no hay admin registrado, usamos el mismo id_usuario_final que sabemos que es válido
            id_admin_final = id_usuario_final

        # 3. Ajustar el id_robot (Acepta tanto el nombre nuevo como el viejo)
        id_robot_final = incidencia.id_robot if incidencia.id_robot is not None else incidencia.robot_id
        if id_robot_final:
            check_robot = fetch_query("SELECT id FROM robots WHERE id = %s", (id_robot_final,))
            if not check_robot:
                id_robot_final = None # Evita fallos de Foreign Key

        # 4. Ajustar el Asunto y el Cuerpo
        asunto_final = incidencia.asunto or f"Fallo [{incidencia.gravedad or 'MEDIA'}]"
        cuerpo_final = incidencia.cuerpo or incidencia.descripcion or "Sin descripción técnica proporcionada."

        print(f"⚙️ Valores procesados para MySQL -> Trabajador: {id_usuario_final}, Administrador: {id_admin_final}, Robot: {id_robot_final}, Asunto: {asunto_final}")

        # 5. Inserción directa en tu tabla de phpMyAdmin incluyendo el id_administrador
        query = """
            INSERT INTO incidencias (id_trabajador, id_administrador, id_robot, asunto, cuerpo, estado, fecha_apertura)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        params = (id_usuario_final, id_admin_final, id_robot_final, asunto_final, cuerpo_final, "abierta", datetime.now())
        
        execute_query(query, params)
        print("✅ --- INSERCIÓN COMPLETADA CON ÉXITO ---\n")
        
        return {"ok": True, "message": "Guardado correctamente"}

    except Exception as e:
        print(f"❌ ERROR CRÍTICO EN BASE DE DATOS: {e}\n")
        raise HTTPException(status_code=500, detail=f"Fallo en MySQL: {str(e)}")


@router.put("/{id}/estado")
def cambiar_estado(id: int, data: EstadoUpdate):
    execute_query(
        "UPDATE incidencias SET estado = %s WHERE id = %s",
        (data.estado, id)
    )
    return {"message": "Estado actualizado"}