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


def list_user_expenses(db: Session, user_id: int) -> list[Expense]:
    return (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
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
