import pytest
from unittest.mock import patch, MagicMock

from app.services.ai_service import (
    generate,
    generate_openrouter,
    generate_ollama,
    PROVIDERS,
)


class TestProviderDispatch:
    def test_valid_providers_exist(self):
        assert "openrouter" in PROVIDERS
        assert "ollama" in PROVIDERS
        assert len(PROVIDERS) == 2

    def test_unknown_provider_falls_back(self):
        result = generate("unknown", "test prompt", {})
        assert isinstance(result, str) and len(result) > 0

    def test_generate_dispatches_all_providers(self):
        for prov in PROVIDERS:
            result = generate(prov, "test", {})
            assert isinstance(result, str) and len(result) > 0


class TestGenerateOpenRouter:
    def test_no_key_returns_message(self):
        result = generate_openrouter("test", {})
        assert "API key not configured" in result
        assert "OPENROUTER_API_KEY" in result


class TestGenerateOllama:
    @patch("httpx.post")
    def test_calls_ollama_endpoint(self, mock_post):
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {"response": "Hello from Ollama"}
        mock_post.return_value = mock_response

        result = generate_ollama("Say hello", {})
        assert result == "Hello from Ollama"
        mock_post.assert_called_once()

    @patch("httpx.post")
    def test_handles_connection_error(self, mock_post):
        from httpx import ConnectError
        mock_post.side_effect = ConnectError("Connection refused")

        result = generate_ollama("test", {})
        assert "Ollama error" in result

    @patch("httpx.post")
    def test_handles_missing_response_field(self, mock_post):
        mock_response = MagicMock()
        mock_response.raise_for_status.return_value = None
        mock_response.json.return_value = {}
        mock_post.return_value = mock_response

        result = generate_ollama("test", {})
        assert result == ""
