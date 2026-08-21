from fastapi import Depends, HTTPException

from ..db.entities import User as UserEntity
from ..repositories.users import UserRepository, get_user_repo
from ..schemas.models import User, UserCreate, UserPage, UserUpdate

class UserService:
    def __init__(self, users: UserRepository):
        self.users = users

    async def list(self, q:str | None, page:int, size:int)-> UserPage:
        rows, total = await self.users.list(q, offset=(page - 1) * size, limit=size)
        return UserPage(items=[User.model_validate(u, from_attributes=True) for u in rows], total=total)

    async def get(self, user_id: int) -> User:
        u = await self.users.get(user_id)
        if not u:
            raise HTTPException(404, "User not found")
        return User.model_validate(u, from_attributes=True)

    async def create(self, body: UserCreate) -> User:
        if await self.users.get_by_email(body.email):
            raise HTTPException(409, "Email already exists")
        u = await self.users.add(UserEntity(**body.model_dump()))
        return User.model_validate(u, from_attributes=True)

    async def update(self, user_id: int, body: UserUpdate) -> User:
        u = await self.users.get(user_id)
        if not u:
            raise HTTPException(404, "User not found")
        for field, value in body.model_dump(exclude_unset=True).items():
            setattr(u, field, value)
        return User.model_validate(u, from_attributes=True)
    async def delete(self, user_id: int) -> None:
        u = await self.users.get(user_id)
        if not u:
            raise HTTPException(404, "User not found")
        await self.users.delete(u)


def get_user_service(users: UserRepository = Depends(get_user_repo)) -> UserService:
    return UserService(users)
