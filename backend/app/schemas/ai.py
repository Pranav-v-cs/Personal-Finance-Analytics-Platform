from pydantic import BaseModel


class GenerateRequest(BaseModel):
    provider: str = "openai"
    prompt: str
    context: dict = {}


class GenerateResponse(BaseModel):
    response: str
