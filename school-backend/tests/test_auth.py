"""
Authentication Tests — Test auth endpoints and utilities

NOTE: This file was previously written with escaped-quote sequences (\\")
which made it a SyntaxError. It is rewritten cleanly here. decode_token()
is async, so the decode tests are async (pytest-asyncio auto mode).
"""

from datetime import datetime, timezone

from app.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


class TestPasswordHashing:
    """Test password hashing utilities."""

    def test_hash_password(self):
        """Test that password hashing works."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert hashed != password
        assert verify_password(password, hashed)

    def test_verify_password_wrong(self):
        """Test that wrong password fails verification."""
        password = "testpassword123"
        hashed = get_password_hash(password)
        assert not verify_password("wrongpassword", hashed)

    def test_hash_password_unique(self):
        """Test that same password produces different hashes (bcrypt salt)."""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        assert hash1 != hash2


class TestJWTTokens:
    """Test JWT token creation and verification."""

    def test_create_access_token(self):
        """Test access token creation."""
        token = create_access_token({"sub": "testuser"})
        assert token is not None
        assert isinstance(token, str)
        assert token.count(".") == 2  # header.payload.signature

    def test_create_refresh_token(self):
        """Test refresh token creation."""
        token = create_refresh_token({"sub": "testuser"})
        assert token is not None
        assert isinstance(token, str)
        assert token.count(".") == 2

    async def test_decode_access_token(self):
        """Test access token decoding."""
        token = create_access_token({"sub": "testuser"})
        payload = await decode_token(token, expected_type="access")
        assert payload is not None
        assert payload["sub"] == "testuser"
        assert payload["type"] == "access"

    async def test_decode_refresh_token(self):
        """Test refresh token decoding."""
        token = create_refresh_token({"sub": "testuser"})
        payload = await decode_token(token, expected_type="refresh")
        assert payload is not None
        assert payload["sub"] == "testuser"
        assert payload["type"] == "refresh"

    async def test_decode_wrong_type_token(self):
        """Test decoding a token with the wrong expected type."""
        token = create_access_token({"sub": "testuser"})
        payload = await decode_token(token, expected_type="refresh")
        assert payload is None

    async def test_decode_invalid_token(self):
        """Test decoding a malformed token."""
        payload = await decode_token("invalid.token.here")
        assert payload is None

    async def test_token_expiration(self):
        """Test that tokens carry a future expiration time."""
        token = create_access_token({"sub": "testuser"})
        payload = await decode_token(token, expected_type="access")
        assert "exp" in payload
        assert payload["exp"] > datetime.now(timezone.utc).timestamp()


class TestUserRole:
    """Test user role utilities."""

    def test_user_role_enum(self):
        """Test UserRole enum values."""
        from app.models import UserRole

        assert UserRole.ADMIN.value == "admin"
        assert UserRole.STAFF.value == "staff"
