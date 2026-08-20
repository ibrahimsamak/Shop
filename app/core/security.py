import hashlib, hmac, os, uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import settings

def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100_000)
    return f"{salt.hex()}${dk.hex()}"

def verify_password(password: str, stored:str)->bool:
    try:
        salt_hex, dk_hex = stored.split("$")
    except ValueError:
        return False
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), 100_000)
    return hmac.compare_digest(dk.hex(), dk_hex)

def _create_token(sub: int, roles: list[str], expires: timedelta, token_type:str)-> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(sub),
        "roles": roles,
        "type": token_type,
        "iat": now,
        "exp": now+expires,
        "jti": str(uuid.uuid4())
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_access_token(sub, roles):
    return _create_token(sub, roles, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), "access")

def create_refresh_token(sub, roles):
    return _create_token(sub, roles, timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS), "refresh")

def decode_token(token:str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])


_bearer = HTTPBearer(auto_error=False)
_UNAUTHORIZED = HTTPException(401, "Not authenticated", headers={"WWW-Authenticate": "Bearer"})

def get_current_user(creds: HTTPAuthorizationCredentials | None = Depends(_bearer))->dict:
    if creds is None:
        raise _UNAUTHORIZED
    try:
        payload = decode_token(creds.credentials)
        if payload.get("type") != "access":
            raise ValueError("not an access token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired", headers={"WWW-Authenticate": "Bearer"})
    except Exception:
        raise HTTPException(401, "Invalid token", headers={"WWW-Authenticate": "Bearer"})

    return {"id": int(payload["sub"]), "roles": payload.get("roles", [])}


def require_roles(*allowed: str):
    def checker(user:dict = Depends(get_current_user))->dict:
        if not any(role in allowed for role in user["roles"]):
            raise HTTPException(403, "Insufficient permissions")
        return user
    return checker
