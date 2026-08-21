from fastapi import Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.entities import Product
from ..db.session import get_db


class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, product_id: int) -> Product | None:
        return await self.db.get(Product, product_id)

    async def low_stock_count(self, threshold: int = 5) -> int:
        return await self.db.scalar(
            select(func.count()).select_from(Product).where(Product.stock < threshold)) or 0

    async def list(self, q: str | None, offset: int, limit: int) -> tuple[list[Product], int]:
        stmt = select(Product)
        if q:
            stmt = stmt.where(func.lower(Product.name).like(f"%{q.lower()}%"))
        total = await self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        rows = (await self.db.scalars(stmt.order_by(Product.id.desc()).offset(offset).limit(limit))).all()
        return list(rows), total

    async def add(self, product: Product) -> Product:
        self.db.add(product)
        await self.db.flush()
        return product

    async def delete(self, product: Product) -> None:
        await self.db.delete(product)


def get_product_repo(db: AsyncSession = Depends(get_db)) -> ProductRepository:
    return ProductRepository(db)
