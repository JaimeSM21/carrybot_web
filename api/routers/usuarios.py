from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from api.database import fetch_query, execute_query
from api.auth import create_token, get_current_user, require_admin
from datetime import datetime
import bcrypt

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


# ── Modelos ──────────────────────────────────────────────────────────────────

class UsuarioRegistro(BaseModel):
    nombre: str
    email: str
    password: str
    id_robots: Optional[List[int]] = []

class UsuarioLogin(BaseModel):
    email: str
    password: str


# ── Rutas públicas (no requieren token) ─────────────────────────────────────

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
        "id": int(id_recien_creado[0]['id']) if id_recien_creado else None
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

    # Generamos el token JWT con los datos del usuario
    token = create_token(
        user_id=user['id'],
        nombre=user['nombre'],
        email=user['email'],
        tipo=user['tipo'],
    )

    return {
        "token": token,
        "id": user['id'],
        "nombre": user['nombre'],
        "email": user['email'],
        "tipo": user['tipo'],
    }


# ── Rutas protegidas (solo administrador) ────────────────────────────────────

@router.get("/")
def get_usuarios(current_user: dict = Depends(require_admin)):
    usuarios = fetch_query("SELECT id, nombre, email, fecha_alta FROM usuarios WHERE tipo = 'trabajador'")
    for u in usuarios:
        asignaciones = fetch_query("SELECT id_robot FROM trabajador_robot WHERE id_trabajador = %s", (u['id'],))
        u['robots'] = [row['id_robot'] for row in asignaciones]
    return usuarios


@router.delete("/{user_id}")
def eliminar_usuario(user_id: int, current_user: dict = Depends(require_admin)):
    execute_query("DELETE FROM trabajador_robot WHERE id_trabajador = %s", (user_id,))
    execute_query("DELETE FROM usuarios WHERE id = %s", (user_id,))
    return {"message": "Eliminado"}


@router.put("/{user_id}")
def actualizar_usuario(user_id: int, datos: dict, current_user: dict = Depends(require_admin)):
    if datos.get('password'):
        hashed = bcrypt.hashpw(datos['password'].encode('utf-8'), bcrypt.gensalt())
        query = "UPDATE usuarios SET nombre=%s, email=%s, password=%s WHERE id=%s"
        params = (datos['nombre'], datos['email'], hashed.decode('utf-8'), user_id)
    else:
        query = "UPDATE usuarios SET nombre=%s, email=%s WHERE id=%s"
        params = (datos['nombre'], datos['email'], user_id)

    execute_query(query, params)
    execute_query("DELETE FROM trabajador_robot WHERE id_trabajador = %s", (user_id,))

    for robot_id in datos.get('id_robots', []):
        execute_query(
            "INSERT INTO trabajador_robot (id_trabajador, id_robot, fecha_asignacion) VALUES (%s, %s, %s)",
            (user_id, int(robot_id), datetime.now())
        )

    return {"message": "Actualizado y flota sincronizada"}


# ── Rutas protegidas (cualquier usuario logueado) ────────────────────────────

@router.get("/asignados/{trabajador_id}")
def get_robots_asignados(trabajador_id: int, current_user: dict = Depends(get_current_user)):
    # Un trabajador solo puede ver sus propios robots asignados
    if current_user['tipo'] != 'administrador' and current_user['id'] != trabajador_id:
        raise HTTPException(status_code=403, detail="No puedes consultar robots de otro usuario.")

    query = """
        SELECT robots.id, robots.codigo, robots.modelo, robots.estado, robots.bateria_pct 
        FROM robots 
        INNER JOIN trabajador_robot ON robots.id = trabajador_robot.id_robot 
        WHERE trabajador_robot.id_trabajador = %s
    """
    return fetch_query(query, (int(trabajador_id),))