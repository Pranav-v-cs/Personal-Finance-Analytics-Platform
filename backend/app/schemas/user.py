from pydantic import BaseModel, ConfigDict, EmailStr, Field


CURRENCIES = [
    "USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD", "CHF", "CNY",
    "BRL", "KRW", "SEK", "NOK", "DKK", "NZD", "SGD", "HKD", "MXN",
    "ZAR", "TRY", "PLN", "CZK", "ILS", "AED", "SAR", "THB", "MYR",
    "PHP", "IDR", "VND",
]


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    model_config = ConfigDict(extra="forbid")


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    currency: str = "USD"

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    model_config = ConfigDict(extra="forbid")

class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    currency: str | None = Field(default=None, min_length=3, max_length=3)

    model_config = ConfigDict(extra="forbid")

class Token(BaseModel):
    access_token: str
    token_type: str
