from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from api.database import fetch_query, execute_query
from datetime import datetime
import bcrypt

router = APIRouter(prefix="/usuarios", tags=["usuarios"])

class UsuarioRegistro(BaseModel):
    nombre: str
    email: str
    password: str

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

    return {"message": "Usuario registrado correctamente"}

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