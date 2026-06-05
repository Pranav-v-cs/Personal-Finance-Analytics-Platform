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


def get_category_monthly(db: Session, user_id: int) -> list[dict]:
    rows = (
        db.query(
            func.strftime("%Y-%m", Expense.transaction_date),
            Expense.category,
            func.coalesce(func.sum(Expense.amount), 0),
        )
        .filter(Expense.user_id == user_id)
        .group_by(func.strftime("%Y-%m", Expense.transaction_date), Expense.category)
        .order_by(func.strftime("%Y-%m", Expense.transaction_date).asc(), Expense.category.asc())
        .all()
    )

    return [
        {
            "month": month,
            "category": category,
            "total_amount": total,
        }
        for month, category, total in rows
        if month is not None
    ]


def get_analytics(db: Session, user_id: int) -> dict:
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .all()
    )

    if not expenses:
        return {
            "weekly_metrics": [],
            "weekday_aggregates": [],
            "anomaly_candidates": [],
        }

    amounts = [float(e.amount) for e in expenses]
    mean = sum(amounts) / len(amounts)
    variance = sum((x - mean) ** 2 for x in amounts) / len(amounts)
    std_dev = variance ** 0.5

    anomaly_candidates = sorted(
        [
            {
                "id": e.id,
                "title": (e.description or "Expense").splitlines()[0].strip() or "Expense",
                "amount": float(e.amount),
                "category": e.category,
                "date": e.transaction_date.isoformat() if e.transaction_date else "",
                "z_score": round((float(e.amount) - mean) / std_dev, 2) if std_dev > 0 else 0,
            }
            for e in expenses
        ],
        key=lambda x: abs(x["z_score"]),
        reverse=True,
    )

    weekday_data: dict[int, dict] = {}
    for e in expenses:
        if e.transaction_date:
            day = e.transaction_date.weekday()
            if day not in weekday_data:
                weekday_data[day] = {"total": 0.0, "count": 0}
            weekday_data[day]["total"] += float(e.amount)
            weekday_data[day]["count"] += 1

    weekday_aggregates = [
        {
            "day": day,
            "total": round(data["total"], 2),
            "count": data["count"],
            "avg": round(data["total"] / data["count"], 2),
        }
        for day, data in sorted(weekday_data.items())
    ]

    weekly: dict[str, dict] = {}
    for e in expenses:
        if e.transaction_date:
            iso = e.transaction_date.isocalendar()
            key = f"{iso[0]}-W{iso[1]:02d}"
            if key not in weekly:
                weekly[key] = {"total": 0.0, "count": 0}
            weekly[key]["total"] += float(e.amount)
            weekly[key]["count"] += 1

    weekly_metrics = [
        {
            "week": week,
            "total": round(data["total"], 2),
            "count": data["count"],
        }
        for week, data in sorted(weekly.items())
    ][-24:]

    largest_transactions = sorted(
        [
            {
                "id": e.id,
                "title": (e.description or "Expense").splitlines()[0].strip() or "Expense",
                "amount": float(e.amount),
                "category": e.category,
                "date": e.transaction_date.isoformat() if e.transaction_date else "",
            }
            for e in expenses
        ],
        key=lambda x: x["amount"],
        reverse=True,
    )[:5]

    return {
        "weekly_metrics": weekly_metrics,
        "weekday_aggregates": weekday_aggregates,
        "anomaly_candidates": anomaly_candidates[:10],
        "largest_transactions": largest_transactions,
    }
