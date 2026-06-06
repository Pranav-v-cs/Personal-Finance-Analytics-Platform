import logging

from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


def _build_system_prompt() -> str:
    return (
        "You are a financial analyst assistant. "
        "You help users understand their personal financial data. "
        "Base all answers strictly on the data provided in the context. "
        "Do not give generic financial advice. "
        "Do not suggest performing transactions, modifying budgets, or creating goals automatically. "
        "Be concise, specific, and data-driven. Use numbers from the context when relevant."
    )


def generate_openrouter(prompt: str, context: dict) -> str:
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        return "OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env"

    client = OpenAI(
        api_key=api_key,
        base_url=settings.OPENROUTER_BASE_URL,
    )
    try:
        response = client.chat.completions.create(
            model=settings.OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": _build_system_prompt()},
                {"role": "user", "content": f"Financial Context:\n{context}\n\nUser Question:\n{prompt}"},
            ],
            max_tokens=1024,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error("OpenRouter error: %s", e)
        return f"OpenRouter error: {str(e)}"


def generate_ollama(prompt: str, context: dict) -> str:
    import httpx

    base_url = settings.OLLAMA_BASE_URL
    model = settings.OLLAMA_MODEL
    full_prompt = f"{_build_system_prompt()}\n\nFinancial Context:\n{context}\n\nUser Question:\n{prompt}"
    try:
        response = httpx.post(
            f"{base_url}/api/generate",
            json={"model": model, "prompt": full_prompt, "stream": False},
            timeout=60,
        )
        response.raise_for_status()
        return response.json().get("response", "")
    except Exception as e:
        logger.error("Ollama error: %s", e)
        return f"Ollama error: {str(e)}"


PROVIDERS = {
    "openrouter": generate_openrouter,
    "ollama": generate_ollama,
}


def generate(provider: str, prompt: str, context: dict) -> str:
    FALLBACK_ORDER = ["openrouter", "ollama"]
    providers_to_try = [provider] + [p for p in FALLBACK_ORDER if p != provider]

    for prov in providers_to_try:
        gen_fn = PROVIDERS.get(prov)
        if not gen_fn:
            continue
        result = gen_fn(prompt, context)
        if not result.startswith(("OpenRouter", "Ollama", "Unknown provider")):
            return result
        logger.warning("%s failed, %s", prov, result[:80])

    return (
        "AI service is temporarily unavailable. All providers returned errors. "
        "Please try again later or check that API keys are configured."
    )
