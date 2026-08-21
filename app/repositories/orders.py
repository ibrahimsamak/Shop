from fastapi import Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.entities import Order, OrderEvent
from ..db.session import get_db


class OrderRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, order_id: int) -> Order | None:
        return await self.db.get(Order, order_id)

    async def list(self, status: str | None, offset: int, limit: int) -> tuple[list[Order], int]:
        stmt = select(Order)
        if status:
            stmt = stmt.where(Order.status == status)
        total = await self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        rows = (await self.db.scalars(stmt.order_by(Order.id.desc()).offset(offset).limit(limit))).all()
        return list(rows), total

    async def count(self) -> int:
        return await self.db.scalar(select(func.count()).select_from(Order)) or 0

    async def revenue(self) -> float:
        return await self.db.scalar(
            select(func.coalesce(func.sum(Order.total), 0.0)).where(Order.status != "cancelled")) or 0.0

    async def revenue_by_month(self) -> dict[int, float]:
        first_event = (select(OrderEvent.order_id, func.min(OrderEvent.at).label("at"))
                       .group_by(OrderEvent.order_id).subquery())
        rows = await self.db.execute(
            select(func.strftime("%m", first_event.c.at), func.sum(Order.total))
            .join(first_event, first_event.c.order_id == Order.id)
            .where(Order.status != "cancelled")
            .group_by(func.strftime("%m", first_event.c.at)))
        return {int(m): round(v, 2) for m, v in rows.all()}


def get_order_repo(db: AsyncSession = Depends(get_db)) -> OrderRepository:
    return OrderRepository(db)
