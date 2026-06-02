from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User
from app.core.security import (
    oauth2_scheme,
    decode_access_token
)


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = decode_access_token(token)
    if payload is None:
        raise _credentials_exception()

    user_id = payload.get("sub")
    if user_id is None:
        raise _credentials_exception()

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        raise _credentials_exception()

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise _credentials_exception()
    
    return user
