from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User
from app.schemas.ai import GenerateRequest, GenerateResponse
from app.services.auth_service import get_current_user
from app.services.ai_service import generate

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate", response_model=GenerateResponse)
def generate_route(
    req: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = generate(req.provider, req.prompt, req.context)
    return GenerateResponse(response=result)
