import logging

from fastapi import HTTPException, status
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


def generate(_provider: str, prompt: str, context: dict) -> str:
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI assistant is not available because no API key is configured. "
                   "Please set the OPENROUTER_API_KEY environment variable and restart the server.",
        )

    client = OpenAI(api_key=api_key, base_url=settings.OPENROUTER_BASE_URL)
    try:
        response = client.chat.completions.create(
            model=settings.OPENROUTER_MODEL,
            extra_headers={
                "HTTP-Referer": "https://finlytics-pranav-v.vercel.app",
                "X-Title": "Finlytics",
            },
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a financial analyst assistant. "
                        "You help users understand their personal financial data. "
                        "Base all answers strictly on the data provided in the context. "
                        "Do not give generic financial advice. "
                        "Do not suggest performing transactions, modifying budgets, or creating goals automatically. "
                        "Be concise, specific, and data-driven. Use numbers from the context when relevant."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Financial Context:\n{context}\n\nUser Question:\n{prompt}",
                },
            ],
            max_tokens=1024,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error("OpenRouter error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"The AI assistant encountered an error while processing your request: {str(e)}. "
                   "Please try again later. If the problem persists, check your OpenRouter API key and configuration.",
        )
