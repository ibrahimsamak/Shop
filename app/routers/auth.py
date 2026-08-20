from fastapi import APIRouter, Depends

from ..core.security import get_current_user
from ..schemas.models import AccessTokenResponse, LoginRequest, RefreshRequest, TokenResponse, User
from ..services.auth import AuthService, get_auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, service: AuthService=Depends(get_auth_service)):
    return await service.login(body.email, body.password)

@router.post("/refresh", response_model=AccessTokenResponse)
async def refresh(body: RefreshRequest, service: AuthService = Depends(get_auth_service)):
    return await service.refresh(body.refresh_token)

@router.post("/logout", status_code=204)
async def logout(body: RefreshRequest, service: AuthService = Depends(get_auth_service)):
    await service.logout(body.refresh_token)

@router.get("/me", response_model=User)
async def me(user: dict = Depends(get_current_user), service: AuthService = Depends(get_auth_service)):
    return await service.me(user["id"])
