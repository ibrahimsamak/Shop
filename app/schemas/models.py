from datetime import datetime

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class User(CamelModel):
    id: int
    name: str
    email: str
    active: bool = True
    roles: list[str] = []

class UserCreate(CamelModel):
    name: str
    email: str
    active: bool = True
    roles: list[str] = ["viewer"]

class UserUpdate(CamelModel):
    name: str | None = None
    email: str | None = None
    active: bool | None = None
    roles: list[str] | None = None

class UserPage(CamelModel):
    items: list[User]
    total: int


class Product(CamelModel):
    id: int
    name: str
    price: float
    stock: int
    category: str
    image_url: str | None = None

class ProductCreate(CamelModel):
    name: str
    price: float
    stock: int
    category: str
    image_url: str | None = None

class ProductUpdate(CamelModel):
    name: str | None = None
    price: float | None = None
    stock: int | None = None
    category: str | None = None
    image_url: str | None = None

class ProductPage(CamelModel):
    items: list[Product]
    total: int

class UploadResult(CamelModel):
    url: str


class OrderItem(CamelModel):
    product_id: int
    name: str
    quantity: int
    price: float

class TimelineEntry(CamelModel):
    status: str
    at: datetime

class Order(CamelModel):
    id: int
    customer: str
    items: list[OrderItem]
    total: float
    status: str
    timeline: list[TimelineEntry]

class OrderPage(CamelModel):
    items: list[Order]
    total: int


class LoginRequest(CamelModel):
    email: str
    password: str

class TokenResponse(CamelModel):
    access_token: str
    refresh_token: str
    roles: list[str]
    user: User

class RefreshRequest(CamelModel):
    refresh_token: str

class AccessTokenResponse(CamelModel):
    access_token: str


class SeriesPoint(CamelModel):
    label: str
    value: float

class DashboardSummary(CamelModel):
    revenue: float
    order_count: int
    user_count: int
    low_stock: int
    revenue_series: list[SeriesPoint]
