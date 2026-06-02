from datetime import date, datetime, time, timedelta
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


def create_expense(
    db: Session,
    user_id: int,
    expense_data: ExpenseCreate
) -> Expense:
    expense = Expense(
        user_id=user_id,
        **expense_data.model_dump(exclude_unset=True)
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


def list_user_expenses_filtered(
    db: Session,
    user_id: int,
    category: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    min_amount: Decimal | None = None,
    max_amount: Decimal | None = None
) -> list[Expense]:
    if start_date and end_date and start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="start_date must be on or before end_date"
        )

    if min_amount is not None and max_amount is not None and min_amount > max_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_amount must be less than or equal to max_amount"
        )

    query = db.query(Expense).filter(Expense.user_id == user_id)

    if category:
        query = query.filter(Expense.category == category)

    if start_date:
        start_datetime = datetime.combine(start_date, time.min)
        query = query.filter(Expense.transaction_date >= start_datetime)

    if end_date:
        end_exclusive = datetime.combine(end_date + timedelta(days=1), time.min)
        query = query.filter(Expense.transaction_date < end_exclusive)

    if min_amount is not None:
        query = query.filter(Expense.amount >= min_amount)

    if max_amount is not None:
        query = query.filter(Expense.amount <= max_amount)

    return (
        query
        .order_by(Expense.transaction_date.desc(), Expense.id.desc())
        .all()
    )


def get_user_expense(
    db: Session,
    user_id: int,
    expense_id: int
) -> Expense | None:
    return (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == user_id
        )
        .first()
    )


def get_user_expense_or_404(
    db: Session,
    user_id: int,
    expense_id: int
) -> Expense:
    expense = get_user_expense(db, user_id, expense_id)
    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    return expense


def update_user_expense(
    db: Session,
    expense: Expense,
    expense_data: ExpenseUpdate
) -> Expense:
    updates = expense_data.model_dump(exclude_unset=True)

    for field_name, value in updates.items():
        setattr(expense, field_name, value)

    db.commit()
    db.refresh(expense)
    return expense


def delete_user_expense(
    db: Session,
    expense: Expense
) -> None:
    db.delete(expense)
    db.commit()
