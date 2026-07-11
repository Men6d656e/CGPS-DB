"""
App Configuration — All settings loaded from environment variables.
Never hard-code secrets here; all required fields will raise an error
at startup if not provided in the .env file.
"""

from pydantic import Field
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ─── Database ───────────────────────────────────────────────────────────
    DATABASE_URL: str
    SYNC_DATABASE_URL: str

    # ─── Application ────────────────────────────────────────────────────────
    APP_NAME: str = "School Management System"
    DEBUG: bool = False
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ─── JWT Authentication ──────────────────────────────────────────────────
    # REQUIRED — generate with: openssl rand -hex 32
    SECRET_KEY: str = Field(..., min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30          # short-lived access token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7             # long-lived refresh token

    # ─── Rate Limiting ───────────────────────────────────────────────────────
    LOGIN_RATE_LIMIT: str = "5/minute"             # max login attempts per IP

    # ─── RSA Encryption (CNIC / B-Form) ─────────────────────────────────────
    RSA_PRIVATE_KEY: str = ""
    RSA_PUBLIC_KEY: str = ""

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
