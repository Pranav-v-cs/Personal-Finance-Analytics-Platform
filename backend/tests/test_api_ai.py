from unittest.mock import patch

import pytest
from fastapi import status


class TestAIGenerate:
    def test_generate_openrouter(self, client, auth_headers):
        with patch("app.routers.ai.generate") as mock_generate:
            mock_generate.return_value = "Mocked OpenRouter response"
            response = client.post("/ai/generate", json={
                "prompt": "Hello",
                "provider": "openrouter",
            }, headers=auth_headers)
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["response"] == "Mocked OpenRouter response"

    def test_generate_ollama(self, client, auth_headers):
        with patch("app.routers.ai.generate") as mock_generate:
            mock_generate.return_value = "Mocked Ollama response"
            response = client.post("/ai/generate", json={
                "prompt": "Hello",
                "provider": "ollama",
            }, headers=auth_headers)
            assert response.status_code == status.HTTP_200_OK
            assert response.json()["response"] == "Mocked Ollama response"

    def test_generate_unknown_provider(self, client, auth_headers):
        with patch("app.routers.ai.generate") as mock_generate:
            mock_generate.return_value = "AI service is temporarily unavailable."
            response = client.post("/ai/generate", json={
                "prompt": "Hello",
                "provider": "unknown",
            }, headers=auth_headers)
            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert "unavailable" in data["response"]

    def test_generate_no_provider_defaults(self, client, auth_headers):
        with patch("app.routers.ai.generate") as mock_generate:
            mock_generate.return_value = "Default response"
            response = client.post("/ai/generate", json={
                "prompt": "Hello",
            }, headers=auth_headers)
            assert response.status_code == status.HTTP_200_OK
            assert response.json()["response"] == "Default response"

    def test_generate_with_context(self, client, auth_headers):
        with patch("app.routers.ai.generate") as mock_generate:
            mock_generate.return_value = "Context-aware response"
            response = client.post("/ai/generate", json={
                "prompt": "Analyze",
                "provider": "openrouter",
                "context": {"month": "June", "total_spent": 1500},
            }, headers=auth_headers)
            assert response.status_code == status.HTTP_200_OK
            assert response.json()["response"] == "Context-aware response"

    def test_generate_unauthorized(self, client):
        response = client.post("/ai/generate", json={
            "prompt": "Hello",
            "provider": "openrouter",
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
