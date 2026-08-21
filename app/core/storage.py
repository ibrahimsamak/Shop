import os
import uuid
from functools import lru_cache

from .config import settings

IMAGE_PREFIX = "products"
LOCAL_DIR = "uploads"


@lru_cache
def _client():
    import boto3
    from botocore.config import Config
    return boto3.client("s3", region_name=settings.AWS_REGION,
                        config=Config(signature_version="s3v4"))


def put_image(data: bytes, ext: str, content_type: str) -> str:
    name = f"{uuid.uuid4().hex}{ext}"
    if settings.S3_BUCKET:
        key = f"{IMAGE_PREFIX}/{name}"
        _client().put_object(Bucket=settings.S3_BUCKET, Key=key,
                             Body=data, ContentType=content_type)
        return key
    os.makedirs(LOCAL_DIR, exist_ok=True)
    with open(os.path.join(LOCAL_DIR, name), "wb") as f:
        f.write(data)
    return f"/static/{name}"


def to_url(stored: str | None) -> str | None:
    if not stored:
        return None
    if stored.startswith(("/", "http")):
        return stored
    return _client().generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET, "Key": stored},
        ExpiresIn=settings.S3_URL_TTL,
    )
