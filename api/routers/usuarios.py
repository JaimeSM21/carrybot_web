from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from api.database import fetch_query, execute_query
from datetime import datetime
import bcrypt

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

# Modelos para recibir los datos de la web
class UsuarioRegistro(BaseModel):
    nombre: str
    email: str
    password: str
    id_robots: Optional[List[int]] = []

class UsuarioLogin(BaseModel):
    email: str
    password: str

@router.post("/registro")
def registro(usuario: UsuarioRegistro):
    existente = fetch_query(
        "SELECT id FROM usuarios WHERE email = %s",
        (usuario.email.strip().lower(),)
    )
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe una cuenta con ese correo.")

    hashed = bcrypt.hashpw(usuario.password.encode('utf-8'), bcrypt.gensalt())

    execute_query(
        "INSERT INTO usuarios (nombre, email, password, tipo, activo, fecha_alta) VALUES (%s, %s, %s, %s, %s, %s)",
        (usuario.nombre.strip(), usuario.email.strip().lower(), hashed.decode('utf-8'), "trabajador", 1, datetime.now())
    )
    
    id_recien_creado = fetch_query("SELECT id FROM usuarios WHERE email = %s", (usuario.email.strip().lower(),))
    
    if id_recien_creado and usuario.id_robots:
        nuevo_user_id = id_recien_creado[0]['id']
        for robot_id in usuario.id_robots:
            execute_query(
                "INSERT INTO trabajador_robot (id_trabajador, id_robot, fecha_asignacion) VALUES (%s, %s, %s)",
                (nuevo_user_id, robot_id, datetime.now())
            )

    return {
        "message": "Usuario registrado correctamente",
        "id": int(nuevo_user_id) if id_recien_creado else None
    }

@router.post("/login")
def login(usuario: UsuarioLogin):
    resultado = fetch_query(
        "SELECT id, nombre, email, password, tipo FROM usuarios WHERE email = %s AND activo = 1",
        (usuario.email.strip().lower(),)
    )

    if not resultado:
        raise HTTPException(status_code=401, detail="No existe ninguna cuenta registrada con ese correo.")

    user = resultado[0]

    if not bcrypt.checkpw(usuario.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="La contraseña no es correcta.")

    return {
        "id": user['id'],
        "nombre": user['nombre'],
        "email": user['email'],
        "tipo": user['tipo'],
    }

@router.get("/")
def get_usuarios():
    usuarios = fetch_query("SELECT id, nombre, email, fecha_alta FROM usuarios WHERE tipo = 'trabajador'")
    for u in usuarios:
        asignaciones = fetch_query("SELECT id_robot FROM trabajador_robot WHERE id_trabajador = %s", (u['id'],))
        u['robots'] = [row['id_robot'] for row in asignaciones]
    return usuarios

@router.delete("/{user_id}")
def eliminar_usuario(user_id: int):
    execute_query("DELETE FROM trabajador_robot WHERE id_trabajador = %s", (user_id,))
    execute_query("DELETE FROM usuarios WHERE id = %s", (user_id,))
    return {"message": "Eliminado"}

@router.put("/{user_id}")
def actualizar_usuario(user_id: int, datos: dict):
    if datos.get('password'):
        hashed = bcrypt.hashpw(datos['password'].encode('utf-8'), bcrypt.gensalt())
        query = "UPDATE usuarios SET nombre=%s, email=%s, password=%s WHERE id=%s"
        params = (datos['nombre'], datos['email'], hashed.decode('utf-8'), user_id)
    else:
        query = "UPDATE usuarios SET nombre=%s, email=%s WHERE id=%s"
        params = (datos['nombre'], datos['email'], user_id)
    
    execute_query(query, params)

    execute_query("DELETE FROM trabajador_robot WHERE id_trabajador = %s", (user_id,))
    
    robots_nuevos = datos.get('id_robots', [])
    for robot_id in robots_nuevos:
        execute_query(
            "INSERT INTO trabajador_robot (id_trabajador, id_robot, fecha_asignacion) VALUES (%s, %s, %s)",
            (user_id, int(robot_id), datetime.now())
        )
        
    return {"message": "Actualizado y flota sincronizada"}


@router.get("/asignados/{trabajador_id}")
def get_robots_asignados(trabajador_id: int):
   
    id_limpio = int(trabajador_id)
    
    
    print(u"\n[CarryBot] Buscando robots en la BBDD para el trabajador ID:", id_limpio)
    
    
    query = """
        SELECT robots.id, robots.codigo, robots.modelo, robots.estado, robots.bateria_pct 
        FROM robots 
        INNER JOIN trabajador_robot ON robots.id = trabajador_robot.id_robot 
        WHERE trabajador_robot.id_trabajador = %s
    """
    
    resultados = fetch_query(query, (id_limpio,))
    
    
    print("[CarryBot] Robots encontrados en MySQL:", resultados, "\n")
    
    return resultados
