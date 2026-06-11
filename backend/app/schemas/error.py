from pydantic import BaseModel


class ErrorResponse(BaseModel):
    detail: str


class ValidationErrorDetail(BaseModel):
    field: str
    message: str


class ValidationErrorResponse(BaseModel):
    detail: list[ValidationErrorDetail]
