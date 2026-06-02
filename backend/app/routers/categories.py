from fastapi import APIRouter

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

DEFAULT_CATEGORIES = [
    "Food",
    "Transport",
    "Bills",
    "Shopping",
    "Entertainment",
    "Healthcare",
    "Other"
]


@router.get("", response_model=list[str])
def list_categories():
    return DEFAULT_CATEGORIES
