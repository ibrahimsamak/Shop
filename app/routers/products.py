from fastapi import APIRouter, Depends, File, Query, UploadFile

from ..core.security import get_current_user, require_roles
from ..schemas.models import Product, ProductCreate, ProductPage, ProductUpdate, UploadResult
from ..services.products import ProductService, get_product_service

router = APIRouter(prefix="/api/products", tags=["products"])

@router.get("", response_model=ProductPage)
async def list_products(page: int = Query(1, ge=1), size: int = Query(20, ge=1, le=100),
                        q: str | None = None, service: ProductService = Depends(get_product_service),
                        _: dict = Depends(get_current_user)):
    return await service.list(q, page, size)

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: int, service: ProductService = Depends(get_product_service),
                      _: dict = Depends(get_current_user)):
    return await service.get(product_id)

@router.post("", response_model=Product, status_code=201)
async def create_product(body: ProductCreate, service: ProductService = Depends(get_product_service),
                         _: dict = Depends(require_roles("admin", "manager"))):
    return await service.create(body)

@router.put("/{product_id}", response_model=Product)
async def update_product(product_id: int, body: ProductUpdate,
                         service: ProductService = Depends(get_product_service),
                         _: dict = Depends(require_roles("admin", "manager"))):
    return await service.update(product_id, body)

@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: int, service: ProductService = Depends(get_product_service),
                         _: dict = Depends(require_roles("admin"))):
    await service.delete(product_id)

@router.post("/{product_id}/image", response_model=UploadResult)
async def upload_image(product_id: int,
                       image: UploadFile = File(...),
                       service: ProductService = Depends(get_product_service),
                       _: dict = Depends(require_roles("admin", "manager"))):
    return await service.save_image(product_id, image)
