import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .core.config import settings
from .db import entities
from .db.base import Base
from .db.seed import seed
from .db.session import SessionLocal, engine
from .routers import auth, dashboard, orders, products, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        await seed(db)
    yield
    await engine.dispose()


app = FastAPI(title="E-Commerce Admin API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=settings.CORS_ORIGINS, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)
os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

for r in (auth, users, products, orders, dashboard):
    app.include_router(r.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}
