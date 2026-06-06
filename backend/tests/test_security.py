import pytest
from unittest.mock import patch, MagicMock

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)


class TestPasswordHashing:
    def test_hash_is_not_plaintext(self):
        hashed = hash_password("password123")
        assert hashed != "password123"
        assert "$2b$" in hashed or "$2a$" in hashed

    def test_verify_correct_password(self):
        hashed = hash_password("password123")
        assert verify_password("password123", hashed) is True

    def test_verify_incorrect_password(self):
        hashed = hash_password("password123")
        assert verify_password("wrongpassword", hashed) is False

    def test_verify_empty_password(self):
        hashed = hash_password("password123")
        assert verify_password("", hashed) is False

    def test_unique_hashes(self):
        h1 = hash_password("samepassword")
        h2 = hash_password("samepassword")
        assert h1 != h2


class TestTokenCreation:
    def test_create_token_returns_string(self):
        token = create_access_token({"sub": "1"})
        assert isinstance(token, str)
        assert len(token) > 20

    def test_token_contains_sub(self):
        token = create_access_token({"sub": "42"})
        payload = decode_access_token(token)
        assert payload["sub"] == "42"

    def test_token_has_expiry(self):
        token = create_access_token({"sub": "1"})
        payload = decode_access_token(token)
        assert "exp" in payload

    def test_token_with_extra_claims(self):
        token = create_access_token({"sub": "1", "role": "admin"})
        payload = decode_access_token(token)
        assert payload["role"] == "admin"


class TestTokenDecoding:
    def test_decode_valid_token(self):
        token = create_access_token({"sub": "1"})
        payload = decode_access_token(token)
        assert payload is not None

    def test_decode_invalid_token(self):
        payload = decode_access_token("invalid-token-here")
        assert payload is None

    def test_decode_expired_token(self):
        from datetime import datetime, timedelta, timezone
        from jose import jwt
        from app.core.config import settings

        expired = datetime.now(timezone.utc) - timedelta(hours=1)
        token = jwt.encode({"sub": "1", "exp": expired}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        payload = decode_access_token(token)
        assert payload is None

    def test_decode_malformed_token(self):
        payload = decode_access_token("")
        assert payload is None
