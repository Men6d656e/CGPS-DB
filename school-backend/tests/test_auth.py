\"\"\"
Authentication Tests — Test auth endpoints and utilities
\"\"\"

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime, timedelta, timezone
from jose import jwt

from app.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.config import settings


class TestPasswordHashing:
    \"\"\"Test password hashing utilities.\"\"\"

    def test_hash_password(self):
        \"\"\"Test that password hashing works.\"\"\"
        password = \"testpassword123\"
        hashed = get_password_hash(password)
        assert hashed != password
        assert verify_password(password, hashed)

    def test_verify_password_wrong(self):
        \"\"\"Test that wrong password fails verification.\"\"\"
        password = \"testpassword123\"
        hashed = get_password_hash(password)
        assert not verify_password(\"wrongpassword\", hashed)

    def test_hash_password_unique(self):
        \"\"\"Test that same password produces different hashes.\"\"\"
        password = \"testpassword123\"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        # bcrypt uses random salt, so hashes should be different
        assert hash1 != hash2


class TestJWTTokens:
    \"\"\"Test JWT token creation and verification.\"\"\"

    def test_create_access_token(self):
        \"\"\"Test access token creation.\"\"\"
        data = {\"sub\": \"testuser\"}
        token = create_access_token(data)
        assert token is not None
        assert isinstance(token, str)

    def test_create_refresh_token(self):
        \"\"\"Test refresh token creation.\"\"\"
        data = {\"sub\": \"testuser\"}
        token = create_refresh_token(data)
        assert token is not None
        assert isinstance(token, str)

    def test_decode_access_token(self):
        \"\"\"Test access token decoding.\"\"\"
        data = {\"sub\": \"testuser\"}
        token = create_access_token(data)
        payload = decode_token(token, expected_type=\"access\")
        assert payload is not None
        assert payload[\"sub\"] == \"testuser\"
        assert payload[\"type\"] == \"access\"

    def test_decode_refresh_token(self):
        \"\"\"Test refresh token decoding.\"\"\"
        data = {\"sub\": \"testuser\"}
        token = create_refresh_token(data)
        payload = decode_token(token, expected_type=\"refresh\")
        assert payload is not None
        assert payload[\"sub\"] == \"testuser\"
        assert payload[\"type\"] == \"refresh\"

    def test_decode_wrong_type_token(self):
        \"\"\"Test decoding token with wrong type.\"\"\"
        data = {\"sub\": \"testuser\"}
        token = create_access_token(data)
        payload = decode_token(token, expected_type=\"refresh\")
        assert payload is None

    def test_decode_invalid_token(self):
        \"\"\"Test decoding invalid token.\"\"\"
        payload = decode_token(\"invalid.token.here\")
        assert payload is None

    def test_token_expiration(self):
        \"\"\"Test that tokens have expiration time.\"\"\"
        data = {\"sub\": \"testuser\"}
        token = create_access_token(data)
        payload = decode_token(token, expected_type=\"access\")
        assert \"exp\" in payload
        assert payload[\"exp\"] > datetime.now(timezone.utc).timestamp()


class TestUserRole:
    \"\"\"Test user role utilities.\"\"\"

    def test_user_role_enum(self):
        \"\"\"Test UserRole enum values.\"\"\"
        from app.models import UserRole
        assert UserRole.ADMIN.value == \"admin\"
        assert UserRole.STAFF.value == \"staff\"
