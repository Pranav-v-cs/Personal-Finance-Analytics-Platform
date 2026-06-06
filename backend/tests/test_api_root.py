import pytest
from fastapi import status


class TestRoot:
    def test_root_returns_message(self, client):
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "Personal Finance Analytics" in data["message"]
