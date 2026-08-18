import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:4200").split(",")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./app.db")

    AWS_REGION: str = os.getenv("AWS_REGION", "eu-central-1")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "")
    S3_URL_TTL: int = int(os.getenv("S3_URL_TTL", "3600"))


settings = Settings()
