from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User
from app.schemas.common import MessageResponse
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.services.auth_service import get_current_user
from app.services.expense_service import (
    create_expense,
    delete_user_expense,
    get_user_expense_or_404,
    list_user_expenses_filtered,
    update_user_expense
)

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post(
    "",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_expense_route(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_expense(db, current_user.id, expense_data)


@router.get(
    "",
    response_model=list[ExpenseResponse]
)
def list_expenses_route(
    category: str | None = Query(default=None, min_length=1, max_length=100),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    min_amount: Decimal | None = Query(default=None, gt=0),
    max_amount: Decimal | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return list_user_expenses_filtered(
        db=db,
        user_id=current_user.id,
        category=category,
        start_date=start_date,
        end_date=end_date,
        min_amount=min_amount,
        max_amount=max_amount
    )


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def get_expense_route(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_expense_or_404(db, current_user.id, expense_id)


@router.put(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def update_expense_route(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = get_user_expense_or_404(db, current_user.id, expense_id)
    return update_user_expense(db, expense, expense_data)


@router.delete(
    "/{expense_id}",
    response_model=MessageResponse
)
def delete_expense_route(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = get_user_expense_or_404(db, current_user.id, expense_id)
    delete_user_expense(db, expense)
    return {"message": "Expense deleted"}
