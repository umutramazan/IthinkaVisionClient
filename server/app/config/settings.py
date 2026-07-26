from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "production"]


class Settings(BaseSettings):
    """Uygulama ayarları. Değerler ortam değişkenlerinden veya .env dosyasından okunur."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="APP_",
        extra="ignore",
    )

    env: Environment = "development"
    name: str = "iThinka Vision API"
    version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"

    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"

    # Virgülle ayrılmış liste; "*" tüm origin'lere izin verir.
    cors_allow_origins: str = "*"

    max_upload_size_mb: int = Field(default=10, ge=1, le=50)
    allowed_image_mime_types: str = "image/jpeg,image/png"

    @field_validator("log_level")
    @classmethod
    def _normalize_log_level(cls, value: str) -> str:
        level = value.upper()
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if level not in allowed:
            raise ValueError(f"log_level {sorted(allowed)} değerlerinden biri olmalı")
        return level

    @property
    def is_production(self) -> bool:
        return self.env == "production"

    @property
    def docs_url(self) -> str | None:
        return None if self.is_production else "/docs"

    @property
    def openapi_url(self) -> str | None:
        return None if self.is_production else "/openapi.json"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_allow_origins.split(",") if origin.strip()]

    @property
    def allowed_mime_types(self) -> set[str]:
        return {
            item.strip().lower()
            for item in self.allowed_image_mime_types.split(",")
            if item.strip()
        }

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
