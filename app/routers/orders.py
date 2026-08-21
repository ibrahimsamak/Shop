from fastapi import APIRouter, Depends, Query

from ..core.security import get_current_user
from ..schemas.models import Order, OrderPage
from ..services.orders import OrderService, get_order_service

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.get("", response_model=OrderPage)
async def list_orders(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
                      status: str | None = None, service: OrderService = Depends(get_order_service),
                      _: dict = Depends(get_current_user)):
    return await service.list(status, page, size)

@router.get("/{order_id}", response_model=Order)
async def get_order(order_id: int, service: OrderService = Depends(get_order_service),
                    _: dict = Depends(get_current_user)):
    return await service.get(order_id)
