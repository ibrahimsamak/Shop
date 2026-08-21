from fastapi import APIRouter, Depends, Query

from ..core.security import get_current_user, require_roles
from ..schemas.models import User, UserCreate, UserPage, UserUpdate
from ..services.users import UserService, get_user_service

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("", response_model=UserPage)
async def list_users(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
                     q: str | None = None, service: UserService = Depends(get_user_service),
                     _: dict = Depends(get_current_user)):
    return await service.list(q, page, size)

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: int, service: UserService = Depends(get_user_service),
                   _: dict = Depends(get_current_user)):
    return await service.get(user_id)

@router.post("", response_model=User, status_code=201)
async def create_user(body: UserCreate, service: UserService = Depends(get_user_service),
                      _: dict = Depends(require_roles("admin"))):
    return await service.create(body)

@router.put("/{user_id}", response_model=User)
async def update_user(user_id: int, body: UserUpdate, service: UserService = Depends(get_user_service),
                      _: dict = Depends(require_roles("admin", "manager"))):
    return await service.update(user_id, body)

@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: int, service: UserService = Depends(get_user_service),
                      _: dict = Depends(require_roles("admin"))):
    await service.delete(user_id)
