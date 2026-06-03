"""
Módulo de autenticación JWT para CarryBot.

Uso en cualquier router:
    from api.auth import get_current_user, require_admin
    
    @router.get("/algo")
    def mi_ruta(current_user: dict = Depends(get_current_user)):
        ...

    @router.get("/solo-admin")
    def solo_admin(current_user: dict = Depends(require_admin)):
        ...
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime, timedelta

# ── Configuración ────────────────────────────────────────────────────────────
# cambiar SECRET_KEY. Generar nueva con: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY = "carrybot-secret-key-cambiar-en-produccion"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 8  # El token dura 8 horas

# HTTPBearer extrae automáticamente el header "Authorization: Bearer <token>"
bearer_scheme = HTTPBearer()


# ── Creación de tokens ───────────────────────────────────────────────────────
def create_token(user_id: int, nombre: str, email: str, tipo: str) -> str:
    """Genera un JWT firmado con los datos del usuario."""
    payload = {
        "sub": str(user_id),   # 'sub' es el campo estándar para el ID
        "nombre": nombre,
        "email": email,
        "tipo": tipo,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ── Dependencias FastAPI ─────────────────────────────────────────────────────
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Dependencia que valida el token JWT y devuelve los datos del usuario.
    Lanza 401 si el token es inválido o ha expirado.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "id": int(payload["sub"]),
            "nombre": payload["nombre"],
            "email": payload["email"],
            "tipo": payload["tipo"],
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado. Vuelve a iniciar sesión.",
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependencia que además de validar el token, exige que el usuario sea administrador.
    Lanza 403 si es un trabajador normal.
    """
    if current_user["tipo"] != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso restringido a administradores.",
        )
    return current_user
