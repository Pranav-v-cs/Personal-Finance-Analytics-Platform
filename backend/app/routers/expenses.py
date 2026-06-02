from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.services.auth_service import get_current_user
from app.services.expense_service import (
    create_expense,
    delete_user_expense,
    get_user_expense,
    list_user_expenses,
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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return list_user_expenses(db, current_user.id)


@router.get(
    "/{expense_id}",
    response_model=ExpenseResponse
)
def get_expense_route(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = get_user_expense(db, current_user.id, expense_id)
    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    return expense


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
    expense = get_user_expense(db, current_user.id, expense_id)
    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    return update_user_expense(db, expense, expense_data)


@router.delete(
    "/{expense_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_expense_route(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = get_user_expense(db, current_user.id, expense_id)
    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    delete_user_expense(db, expense)
