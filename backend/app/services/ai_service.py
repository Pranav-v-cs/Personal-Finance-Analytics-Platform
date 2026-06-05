import os
import logging

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


def generate_gemini(prompt: str, context: dict) -> str:
    import google.generativeai as genai

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "Gemini API key not configured. Set GEMINI_API_KEY in .env"

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    full_prompt = f"{_build_system_prompt()}\n\nFinancial Context:\n{context}\n\nUser Question:\n{prompt}"
    try:
        response = model.generate_content(full_prompt)
        return response.text
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return f"Gemini error: {str(e)}"


def generate_openai(prompt: str, context: dict) -> str:
    from openai import OpenAI

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return "OpenAI API key not configured. Set OPENAI_API_KEY in .env"

    client = OpenAI(api_key=api_key)
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": _build_system_prompt()},
                {"role": "user", "content": f"Financial Context:\n{context}\n\nUser Question:\n{prompt}"},
            ],
            max_tokens=1024,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"OpenAI error: {e}")
        return f"OpenAI error: {str(e)}"


def generate_ollama(prompt: str, context: dict) -> str:
    import httpx

    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    model = os.getenv("OLLAMA_MODEL", "llama3.2")
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
        logger.error(f"Ollama error: {e}")
        return f"Ollama error: {str(e)}"


PROVIDERS = {
    "gemini": generate_gemini,
    "openai": generate_openai,
    "ollama": generate_ollama,
}


def generate(provider: str, prompt: str, context: dict) -> str:
    gen_fn = PROVIDERS.get(provider)
    if not gen_fn:
        return f"Unknown provider: {provider}. Supported: {', '.join(PROVIDERS.keys())}"
    return gen_fn(prompt, context)
