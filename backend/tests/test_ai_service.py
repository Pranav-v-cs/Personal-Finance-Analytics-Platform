from unittest.mock import patch, MagicMock

from app.services.ai_service import generate, generate_openrouter


class TestGenerateOpenRouter:
    def test_no_key_returns_message(self):
        with patch("app.services.ai_service.settings.OPENROUTER_API_KEY", ""):
            result = generate_openrouter("test", {})
            assert "API key not configured" in result
            assert "OPENROUTER_API_KEY" in result

    def test_calls_openrouter_endpoint(self):
        with patch("app.services.ai_service.settings.OPENROUTER_API_KEY", "sk-test-key"):
            with patch("app.services.ai_service.OpenAI") as mock_openai:
                mock_client = MagicMock()
                mock_openai.return_value = mock_client
                mock_choice = MagicMock()
                mock_choice.message.content = "Hello from OpenRouter"
                mock_client.chat.completions.create.return_value.choices = [mock_choice]

                result = generate_openrouter("Say hello", {})
                assert result == "Hello from OpenRouter"
                mock_client.chat.completions.create.assert_called_once()

    def test_handles_api_error(self):
        with patch("app.services.ai_service.settings.OPENROUTER_API_KEY", "sk-test-key"):
            with patch("app.services.ai_service.OpenAI") as mock_openai:
                mock_client = MagicMock()
                mock_openai.return_value = mock_client
                mock_client.chat.completions.create.side_effect = Exception("API error")

                result = generate_openrouter("test", {})
                assert "OpenRouter error" in result


class TestGenerate:
    def test_returns_result_from_openrouter(self):
        with patch("app.services.ai_service.settings.OPENROUTER_API_KEY", "sk-test-key"):
            with patch("app.services.ai_service.OpenAI") as mock_openai:
                mock_client = MagicMock()
                mock_openai.return_value = mock_client
                mock_choice = MagicMock()
                mock_choice.message.content = "Mocked response"
                mock_client.chat.completions.create.return_value.choices = [mock_choice]

                result = generate("openrouter", "test", {})
                assert result == "Mocked response"

    def test_ignores_unrecognized_provider(self):
        with patch("app.services.ai_service.settings.OPENROUTER_API_KEY", "sk-test-key"):
            with patch("app.services.ai_service.OpenAI") as mock_openai:
                mock_client = MagicMock()
                mock_openai.return_value = mock_client
                mock_choice = MagicMock()
                mock_choice.message.content = "Mocked response"
                mock_client.chat.completions.create.return_value.choices = [mock_choice]

                result = generate("unknown", "test", {})
                assert result == "Mocked response"
