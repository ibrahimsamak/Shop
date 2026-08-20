from fastapi import Depends
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.entities import User
from ..db.session import get_db


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, user_id: int)-> User | None:
        return await self.db.get(User,user_id)

    async def get_by_email(self, email:str)-> User | None:
        return await self.db.scalar(select(User).where(User.email == email.lower()))

    async def count(self) -> int:
        return await self.db.scalar(select(func.count()).select_from(User)) or 0


    async def list(self, q: str | None, offset: int, limit: int) -> tuple[list[User], int]:
        stmt = select(User)
        if q:
            like = f"%{q.lower()}%"
            stmt = stmt.where(or_(func.lower(User.name).like(like), func.lower(User.email).like(like)))
        total = await self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        rows = (await self.db.scalars(stmt.order_by(User.id.desc()).offset(offset).limit(limit))).all()
        return list(rows), total

    async def add(self, user: User) -> User:
        self.db.add(user)
        await self.db.flush()
        return user

    async def delete(self, user: User) -> None:
        await self.db.delete(user)


def get_user_repo(db: AsyncSession = Depends(get_db))-> UserRepository:
    return UserRepository(db)
