from fastapi import Depends, HTTPException

from ..repositories.orders import OrderRepository, get_order_repo
from ..schemas.models import Order, OrderPage


class OrderService:
    def __init__(self, orders: OrderRepository):
        self.orders = orders

    async def list(self, status: str | None, page: int, size: int) -> OrderPage:
        rows, total = await self.orders.list(status, offset=(page - 1) * size, limit=size)
        return OrderPage(items=[Order.model_validate(o, from_attributes=True) for o in rows], total=total)

    async def get(self, order_id: int) -> Order:
        o = await self.orders.get(order_id)
        if not o:
            raise HTTPException(404, "Order not found")
        return Order.model_validate(o, from_attributes=True)


def get_order_service(orders: OrderRepository = Depends(get_order_repo)) -> OrderService:
    return OrderService(orders)
