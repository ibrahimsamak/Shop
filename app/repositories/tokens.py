from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.entities import RefreshToken
from ..db.session import get_db


class RefreshTokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add(self, jti: str, user_id:str) -> None:
        self.db.add(RefreshToken(jti=jti, user_id=user_id))

    async def exists(self, jti: str)-> bool:
        return await self.db.get(RefreshToken, jti) is not None

    async def remove(self, jti:str)->None:
        token = await self.db.get(RefreshToken, jti)
        if token:
            await self.db.delete(token)

def get_token_repo(db: AsyncSession = Depends(get_db)) -> RefreshTokenRepository:
    return RefreshTokenRepository(db)
