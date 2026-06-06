from datetime import date, datetime, timedelta, timezone

import pytest
from fastapi import status


class TestRegister:
    def test_register_success(self, client):
        response = client.post("/auth/register", json={
            "name": "New User",
            "email": "newuser@example.com",
            "password": "SecurePass123!",
        })
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "id" in data
        assert data["email"] == "newuser@example.com"
        assert "password" not in data

    def test_register_duplicate_email(self, client, auth_headers):
        response = client.post("/auth/register", json={
            "name": "Duplicate",
            "email": "test@example.com",
            "password": "SecurePass123!",
        })
        assert response.status_code == status.HTTP_409_CONFLICT

    def test_register_invalid_email(self, client):
        response = client.post("/auth/register", json={
            "name": "Bad Email",
            "email": "not-an-email",
            "password": "SecurePass123!",
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_short_password(self, client):
        response = client.post("/auth/register", json={
            "name": "Short Pwd",
            "email": "new@example.com",
            "password": "ab",
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestLogin:
    def test_login_success(self, client, test_user):
        response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "password123",
        })
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, test_user):
        response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "wrongpassword",
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, client):
        response = client.post("/auth/login", json={
            "email": "nobody@example.com",
            "password": "password123",
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_bad_email_format(self, client):
        response = client.post("/auth/login", json={
            "email": "not-an-email",
            "password": "password123",
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestGetMe:
    def test_get_me_success(self, client, auth_headers):
        response = client.get("/auth/me", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == "test@example.com"
        assert "id" in data

    def test_get_me_unauthorized(self, client):
        response = client.get("/auth/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestProtectedEndpoint:
    def test_no_token(self, client):
        response = client.get("/expenses")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_invalid_token(self, client):
        response = client.get("/expenses", headers={"Authorization": "Bearer invalidtoken"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_expired_token(self, client):
        from jose import jwt
        from app.core.config import settings
        from datetime import datetime, timedelta, timezone

        expired = datetime.now(timezone.utc) - timedelta(hours=1)
        token = jwt.encode({"sub": "1", "exp": expired}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        response = client.get("/expenses", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
