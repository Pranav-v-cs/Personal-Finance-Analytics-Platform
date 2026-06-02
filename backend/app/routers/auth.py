from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User
from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)
from app.services.auth_service import get_current_user

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


def _invalid_credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
        headers={"WWW-Authenticate": "Bearer"}
    )

@router.get(
    "/me",
    response_model=UserResponse
)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.post(
    "/register",
    response_model=UserResponse
)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    hashed_password = hash_password(
        user.password
    )

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post(
    "/login",
    response_model=Token
)
def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )
    
    if not user:
        raise _invalid_credentials_exception()
    
    if not verify_password(
        user_data.password,
        user.hashed_password
    ):
        raise _invalid_credentials_exception()
    
    access_token = create_access_token(
        {"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
