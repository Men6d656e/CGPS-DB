"""
Authentication Utilities — Password hashing, JWT creation/verification,
refresh token management, and simple authentication.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import uuid4

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import User

# ─── In-memory token blacklist (replace with Redis in production) ─────────────
# Stores (jti, expiry) of invalidated refresh tokens
_revoked_tokens: set[str] = set()


# ─── Password Hashing ─────────────────────────────────────────────────────────

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# ─── JWT Token Utilities ──────────────────────────────────────────────────────

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a short-lived access token (default 30 minutes).

    Includes a unique ``jti`` (JWT ID) so the token can be individually
    revoked via the database revocation list.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access", "jti": uuid4().hex})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a long-lived refresh token (default 7 days).

    Includes a unique ``jti`` (JWT ID) so the token can be individually
    revoked via the database revocation list.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh", "jti": uuid4().hex})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def decode_token(token: str, expected_type: str = "access", db: AsyncSession = None) -> Optional[dict]:
    """Decode a JWT token and return the payload, or None if invalid/expired/wrong-type."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != expected_type:
            return None
        # Check revocation list in database
        jti = payload.get("jti")
        if jti and db:
            result = await db.execute(
                select(RevokedToken).where(RevokedToken.token_jti == jti)
            )
            if result.scalar_one_or_none():
                return None
        return payload
    except JWTError:
        return None


async def revoke_token(token: str, db: AsyncSession) -> None:
    """Add a token's jti to the revocation list in the database."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM],
            options={"verify_exp": False}
        )
        jti = payload.get("jti") or payload.get("sub")
        if jti:
            # Check if already revoked
            result = await db.execute(
                select(RevokedToken).where(RevokedToken.token_jti == jti)
            )
            if not result.scalar_one_or_none():
                # Get expiration time from token
                exp = payload.get("exp")
                expires_at = datetime.fromtimestamp(exp, tz=timezone.utc) if exp else datetime.now(timezone.utc) + timedelta(days=7)
                
                revoked_token = RevokedToken(
                    token_jti=jti,
                    expires_at=expires_at
                )
                db.add(revoked_token)
                await db.commit()
    except JWTError:
        pass


# ─── FastAPI Dependencies ─────────────────────────────────────────────────────

security_scheme = HTTPBearer()


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency: extracts access token from cookie, validates it, returns the authenticated User."""
    token = request.cookies.get("access_token")
    
    # Fallback to Authorization header for flexibility
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing access token",
        )

    payload = await decode_token(token, expected_type="access", db=db)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
        )
    username: str | None = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
