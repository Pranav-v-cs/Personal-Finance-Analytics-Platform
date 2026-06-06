import pytest
from fastapi import HTTPException, status

from app.services.auth_service import get_current_user
from app.core.security import create_access_token, decode_access_token


class TestGetCurrentUser:
    def test_success(self, db, test_user):
        token = create_access_token({"sub": str(test_user.id)})
        user = get_current_user(token=token, db=db)
        assert user.id == test_user.id
        assert user.email == test_user.email

    def test_invalid_token_decode_fails(self, db):
        with pytest.raises(HTTPException) as exc:
            get_current_user(token="totally-invalid-token", db=db)
        assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED

    def test_token_missing_sub_claim(self, db):
        token = create_access_token({"not_sub": "42"})
        with pytest.raises(HTTPException) as exc:
            get_current_user(token=token, db=db)
        assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED

    def test_non_integer_sub_claim(self, db):
        token = create_access_token({"sub": "not-a-number"})
        with pytest.raises(HTTPException) as exc:
            get_current_user(token=token, db=db)
        assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED

    def test_float_sub_claim(self, db):
        token = create_access_token({"sub": "3.14"})
        with pytest.raises(HTTPException) as exc:
            get_current_user(token=token, db=db)
        assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED

    def test_empty_string_sub_claim(self, db):
        token = create_access_token({"sub": ""})
        with pytest.raises(HTTPException) as exc:
            get_current_user(token=token, db=db)
        assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED

    def test_nonexistent_user_id(self, db):
        token = create_access_token({"sub": "99999"})
        with pytest.raises(HTTPException) as exc:
            get_current_user(token=token, db=db)
        assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED

    def test_negative_user_id(self, db):
        token = create_access_token({"sub": "-1"})
        with pytest.raises(HTTPException) as exc:
            get_current_user(token=token, db=db)
        assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
