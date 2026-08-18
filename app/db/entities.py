from datetime import datetime, timezone
from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class User(Base):
    __tablename__ = "users"
    id:            Mapped[int]  = mapped_column(primary_key=True)
    name:          Mapped[str]  = mapped_column(String(120))
    email:         Mapped[str]  = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(default=None)
    active:        Mapped[bool] = mapped_column(default=True)
    roles:         Mapped[list[str]] = mapped_column(JSON, default=list)


class Product(Base):
    __tablename__ = "products"
    id:        Mapped[int]  = mapped_column(primary_key=True)
    name:      Mapped[str]  = mapped_column(String(120), index=True)
    price:     Mapped[float]
    stock:     Mapped[int]
    category:  Mapped[str]  = mapped_column(String(60))
    image_url: Mapped[str | None] = mapped_column(default=None)


class Order(Base):
    __tablename__ = "orders"
    id:       Mapped[int]   = mapped_column(primary_key=True)
    customer: Mapped[str]   = mapped_column(String(120))
    total:    Mapped[float]
    status:   Mapped[str]   = mapped_column(String(20), index=True)
    items:    Mapped[list["OrderItem"]]  = relationship(cascade="all, delete-orphan", lazy="selectin")
    timeline: Mapped[list["OrderEvent"]] = relationship(cascade="all, delete-orphan", order_by="OrderEvent.at", lazy="selectin")


class OrderItem(Base):
    __tablename__ = "order_items"
    id:         Mapped[int]  = mapped_column(primary_key=True)
    order_id:   Mapped[int]  = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[int]
    name:       Mapped[str]  = mapped_column(String(120))
    quantity:   Mapped[int]
    price:      Mapped[float]


class OrderEvent(Base):
    __tablename__ = "order_events"
    id:       Mapped[int]      = mapped_column(primary_key=True)
    order_id: Mapped[int]      = mapped_column(ForeignKey("orders.id"))
    status:   Mapped[str]      = mapped_column(String(20))
    at:       Mapped[datetime] = mapped_column(DateTime(timezone=True))


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    jti:        Mapped[str]      = mapped_column(String(36), primary_key=True)
    user_id:    Mapped[int]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True),
                                                 default=lambda: datetime.now(timezone.utc))
