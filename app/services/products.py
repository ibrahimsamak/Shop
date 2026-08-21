import os
from fastapi import Depends, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from ..core import storage
from ..db.entities import Product as ProductEntity
from ..repositories.products import ProductRepository, get_product_repo
from ..schemas.models import Product, ProductCreate, ProductPage, ProductUpdate, UploadResult

_ALLOWED = {"image/png", "image/jpeg", "image/webp", "image/gif"}


class ProductService:
    def __init__(self, products: ProductRepository):
        self.products = products

    def _to_schema(self, p: ProductEntity) -> Product:
        m = Product.model_validate(p, from_attributes=True)
        m.image_url = storage.to_url(p.image_url)
        return m

    async def list(self, q: str | None, page: int, size: int) -> ProductPage:
        rows, total = await self.products.list(q, offset=(page - 1) * size, limit=size)
        return ProductPage(items=[self._to_schema(p) for p in rows], total=total)

    async def get(self, product_id: int) -> Product:
        return self._to_schema(await self._require(product_id))

    async def create(self, body: ProductCreate) -> Product:
        p = await self.products.add(ProductEntity(**body.model_dump()))
        return self._to_schema(p)

    async def update(self, product_id: int, body: ProductUpdate) -> Product:
        p = await self._require(product_id)
        for field, value in body.model_dump(exclude_unset=True).items():
            setattr(p, field, value)
        return self._to_schema(p)

    async def delete(self, product_id: int) -> None:
        await self.products.delete(await self._require(product_id))

    async def save_image(self, product_id: int, image: UploadFile) -> UploadResult:
        p = await self._require(product_id)
        if image.content_type not in _ALLOWED:
            raise HTTPException(415, "Unsupported image type")
        ext = os.path.splitext(image.filename or "")[1] or ".bin"
        data = await image.read()
        p.image_url = await run_in_threadpool(storage.put_image, data, ext, image.content_type)
        return UploadResult(url=storage.to_url(p.image_url))

    async def _require(self, product_id: int) -> ProductEntity:
        p = await self.products.get(product_id)
        if not p:
            raise HTTPException(404, "Product not found")
        return p


def get_product_service(products: ProductRepository = Depends(get_product_repo)) -> ProductService:
    return ProductService(products)
