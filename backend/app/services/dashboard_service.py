from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.models import Expense


def get_dashboard_summary(db: Session, user_id: int) -> dict:
    totals = (
        db.query(
            func.coalesce(func.sum(Expense.amount), 0),
            func.count(Expense.id),
            func.min(Expense.transaction_date),
            func.max(Expense.transaction_date),
        )
        .filter(Expense.user_id == user_id)
        .one()
    )

    category_rows = (
        db.query(
            Expense.category,
            func.coalesce(func.sum(Expense.amount), 0),
            func.count(Expense.id)
        )
        .filter(Expense.user_id == user_id)
        .group_by(Expense.category)
        .order_by(Expense.category.asc())
        .all()
    )

    total_expenses = totals[0]
    expense_count = totals[1]
    min_date = totals[2]
    max_date = totals[3]

    active_days = 0
    if min_date is not None and max_date is not None:
        active_days = max((max_date - min_date).days + 1, 1)

    avg_per_day = total_expenses / active_days if active_days else 0

    top_category = None
    if category_rows:
        top_category_row = max(category_rows, key=lambda row: row[1])
        top_total = top_category_row[1]
        top_percent = (top_total / total_expenses * 100) if total_expenses else 0
        top_category = {
            "category": top_category_row[0],
            "total": top_total,
            "percent": top_percent,
        }

    return {
        "total_expenses": total_expenses,
        "expense_count": expense_count,
        "avg_per_day": avg_per_day,
        "top_category": top_category,
        "category_breakdown": [
            {
                "category": category,
                "total_amount": total_amount,
                "expense_count": expense_count
            }
            for category, total_amount, expense_count in category_rows
        ]
    }


def get_monthly_spending(db: Session, user_id: int) -> list[dict]:
    month_rows = (
        db.query(
            func.strftime("%Y-%m", Expense.transaction_date),
            func.coalesce(func.sum(Expense.amount), 0)
        )
        .filter(Expense.user_id == user_id)
        .group_by(func.strftime("%Y-%m", Expense.transaction_date))
        .order_by(func.strftime("%Y-%m", Expense.transaction_date).asc())
        .all()
    )

    return [
        {
            "month": month,
            "total_amount": total_amount
        }
        for month, total_amount in month_rows
        if month is not None
    ]


def get_dashboard_categories(db: Session, user_id: int) -> list[dict]:
    total_expenses = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.user_id == user_id)
        .scalar()
    )

    category_rows = (
        db.query(
            Expense.category,
            func.coalesce(func.sum(Expense.amount), 0)
        )
        .filter(Expense.user_id == user_id)
        .group_by(Expense.category)
        .order_by(func.coalesce(func.sum(Expense.amount), 0).desc())
        .all()
    )

    return [
        {
            "category": category,
            "total": total,
            "percent": (total / total_expenses * 100) if total_expenses else 0,
        }
        for category, total in category_rows
    ]


def get_dashboard_recent(db: Session, user_id: int) -> list[dict]:
    recent_rows = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .order_by(Expense.transaction_date.desc(), Expense.id.desc())
        .limit(5)
        .all()
    )

    def _title_from_description(description: str | None) -> str:
        if not description:
            return "Expense"
        first_line = description.splitlines()[0].strip()
        return first_line or "Expense"

    return [
        {
            "id": expense.id,
            "title": _title_from_description(expense.description),
            "amount": expense.amount,
            "category": expense.category,
            "date": expense.transaction_date.isoformat() if expense.transaction_date else "",
        }
        for expense in recent_rows
    ]
