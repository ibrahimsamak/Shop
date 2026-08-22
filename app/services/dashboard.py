from fastapi import Depends

from ..repositories.orders import OrderRepository, get_order_repo
from ..repositories.products import ProductRepository, get_product_repo
from ..repositories.users import UserRepository, get_user_repo
from ..schemas.models import DashboardSummary, SeriesPoint

_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]


class DashboardService:
    def __init__(self, orders: OrderRepository, products: ProductRepository, users: UserRepository):
        self.orders, self.products, self.users = orders, products, users

    async def summary(self) -> DashboardSummary:
        by_month = await self.orders.revenue_by_month()
        series = [SeriesPoint(label=_MONTHS[m - 1], value=v) for m, v in sorted(by_month.items())]
        return DashboardSummary(
            revenue=round(await self.orders.revenue(), 2),
            order_count=await self.orders.count(),
            user_count=await self.users.count(),
            low_stock=await self.products.low_stock_count(),
            revenue_series=series,
        )


def get_dashboard_service(orders: OrderRepository = Depends(get_order_repo),
                          products: ProductRepository = Depends(get_product_repo),
                          users: UserRepository = Depends(get_user_repo)) -> DashboardService:
    return DashboardService(orders, products, users)
