from fastapi import APIRouter, Depends

from ..core.security import get_current_user
from ..schemas.models import DashboardSummary
from ..services.dashboard import DashboardService, get_dashboard_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/summary", response_model=DashboardSummary)
async def summary(service: DashboardService = Depends(get_dashboard_service),
                  _: dict = Depends(get_current_user)):
    return await service.summary()
