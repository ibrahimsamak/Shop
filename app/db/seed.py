import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.security import hash_password
from .entities import Order, OrderEvent, OrderItem, Product, User


async def seed(db: AsyncSession) -> None:
    if await db.scalar(select(User.id).limit(1)):
        return
    try:
        await _populate(db)
        await db.commit()
    except IntegrityError:
        await db.rollback()


async def _populate(db: AsyncSession) -> None:
    db.add_all([
        User(name="Ada Admin",   email="admin@shop.io",   password_hash=hash_password("admin123"),   roles=["admin"]),
        User(name="Max Manager", email="manager@shop.io", password_hash=hash_password("manager123"), roles=["manager"]),
        User(name="Vic Viewer",  email="viewer@shop.io",  password_hash=hash_password("viewer123"),  roles=["viewer"]),
    ])

    first = ["Ada","Max","Vic","Sam","Noor","Leo","Mia","Omar","Ivy","Zoe","Kai","Lena"]
    last  = ["Khan","Patel","Lee","Nguyen","Garcia","Silva","Brown","Cohen","Rossi","Diallo"]
    for i in range(4, 61):
        db.add(User(name=f"{random.choice(first)} {random.choice(last)}", email=f"user{i}@shop.io",
                    active=random.random() > 0.2, roles=[random.choice(["viewer", "manager"])]))

    cats = ["Laptops","Phones","Audio","Accessories","Wearables","Cameras"]
    adj  = ["Pro","Air","Max","Lite","Ultra","Mini","Plus","Edge"]
    noun = ["Notebook","Handset","Buds","Charger","Watch","Lens","Hub","Stand"]
    products = [Product(name=f"{random.choice(noun)} {random.choice(adj)} {random.randint(1,9)}",
                        price=round(random.uniform(19, 1999), 2), stock=random.randint(0, 50),
                        category=random.choice(cats)) for _ in range(60)]
    db.add_all(products)
    await db.flush()

    statuses = ["pending","paid","shipped","delivered","cancelled"]
    customers = ["Ada Khan","Max Patel","Vic Lee","Sam Nguyen","Noor Garcia","Leo Silva"]
    now = datetime.now(timezone.utc)
    for _ in range(40):
        picks = random.sample(products, k=random.randint(1, 3))
        items = [OrderItem(product_id=p.id, name=p.name, quantity=random.randint(1, 4), price=p.price)
                 for p in picks]
        total = round(sum(it.price * it.quantity for it in items), 2)
        status = random.choice(statuses)
        created = now - timedelta(days=random.randint(0, 120), hours=random.randint(0, 23))
        flow, timeline, t = ["pending","paid","shipped","delivered"], [], created
        for s in flow:
            timeline.append(OrderEvent(status=s, at=t))
            t += timedelta(hours=random.randint(6, 48))
            if s == status:
                break
        if status == "cancelled":
            timeline = [OrderEvent(status="pending", at=created),
                        OrderEvent(status="cancelled", at=created + timedelta(hours=5))]
        db.add(Order(customer=random.choice(customers), total=total, status=status,
                     items=items, timeline=timeline))
