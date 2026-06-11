from collections import defaultdict
from datetime import datetime, timezone

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
            func.count(Expense.id),
        )
        .filter(Expense.user_id == user_id)
        .group_by(Expense.category)
        .order_by(Expense.category.asc())
        .all()
    )

    total_expenses, expense_count, min_date, max_date = totals

    active_days = 0
    if min_date is not None and max_date is not None:
        active_days = max((max_date - min_date).days + 1, 1)

    avg_per_day = total_expenses / active_days if active_days else 0

    top_category = None
    if category_rows:
        top_row = max(category_rows, key=lambda row: row[1])
        top_total = top_row[1]
        top_percent = (top_total / total_expenses * 100) if total_expenses else 0
        top_category = {
            "category": top_row[0],
            "total": top_total,
            "percent": top_percent,
        }

    return {
        "total_expenses": total_expenses,
        "expense_count": expense_count,
        "avg_per_day": avg_per_day,
        "top_category": top_category,
        "category_breakdown": [
            {"category": cat, "total_amount": amt, "expense_count": cnt}
            for cat, amt, cnt in category_rows
        ],
    }


def get_monthly_spending(db: Session, user_id: int) -> list[dict]:
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .order_by(Expense.transaction_date.asc())
        .all()
    )

    monthly: dict[str, float] = {}
    for e in expenses:
        if e.transaction_date:
            month = e.transaction_date.strftime("%Y-%m")
            monthly[month] = monthly.get(month, 0) + float(e.amount)

    return [
        {"month": month, "total_amount": round(total, 2)}
        for month, total in sorted(monthly.items())
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
            func.coalesce(func.sum(Expense.amount), 0),
        )
        .filter(Expense.user_id == user_id)
        .group_by(Expense.category)
        .order_by(func.coalesce(func.sum(Expense.amount), 0).desc())
        .all()
    )

    return [
        {
            "category": cat,
            "total": total,
            "percent": (total / total_expenses * 100) if total_expenses else 0,
        }
        for cat, total in category_rows
    ]


def get_dashboard_recent(db: Session, user_id: int) -> list[dict]:
    recent_rows = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .order_by(Expense.transaction_date.desc(), Expense.id.desc())
        .limit(5)
        .all()
    )

    def _title(description: str | None) -> str:
        if not description:
            return "Expense"
        first_line = description.splitlines()[0].strip()
        return first_line or "Expense"

    return [
        {
            "id": e.id,
            "title": _title(e.description),
            "amount": e.amount,
            "category": e.category,
            "date": e.transaction_date.isoformat() if e.transaction_date else "",
        }
        for e in recent_rows
    ]


def get_category_monthly(db: Session, user_id: int) -> list[dict]:
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == user_id)
        .order_by(Expense.transaction_date.asc(), Expense.category.asc())
        .all()
    )

    grouped: dict[tuple[str, str], float] = {}
    for e in expenses:
        if e.transaction_date:
            month = e.transaction_date.strftime("%Y-%m")
            grouped[(month, e.category)] = grouped.get((month, e.category), 0) + float(e.amount)

    return [
        {"month": month, "category": cat, "total_amount": round(total, 2)}
        for (month, cat), total in sorted(grouped.items())
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
            "largest_transactions": [],
        }

    amounts = [float(e.amount) for e in expenses]
    mean = sum(amounts) / len(amounts)
    variance = sum((x - mean) ** 2 for x in amounts) / len(amounts)
    std_dev = variance ** 0.5

    def _txn_dict(e):
        return {
            "id": e.id,
            "title": (e.description or "Expense").splitlines()[0].strip() or "Expense",
            "amount": float(e.amount),
            "category": e.category,
            "date": e.transaction_date.isoformat() if e.transaction_date else "",
        }

    anomaly_candidates = sorted(
        [
            {**_txn_dict(e), "z_score": round((float(e.amount) - mean) / std_dev, 2) if std_dev > 0 else 0}
            for e in expenses
        ],
        key=lambda x: abs(x["z_score"]),
        reverse=True,
    )

    weekday_data = defaultdict(lambda: {"total": 0.0, "count": 0})
    weekly_data = defaultdict(lambda: {"total": 0.0, "count": 0})

    for e in expenses:
        if e.transaction_date:
            day = e.transaction_date.weekday()
            weekday_data[day]["total"] += float(e.amount)
            weekday_data[day]["count"] += 1

            iso = e.transaction_date.isocalendar()
            week_key = f"{iso[0]}-W{iso[1]:02d}"
            weekly_data[week_key]["total"] += float(e.amount)
            weekly_data[week_key]["count"] += 1

    weekday_aggregates = [
        {"day": day, "total": round(d["total"], 2), "count": d["count"], "avg": round(d["total"] / d["count"], 2)}
        for day, d in sorted(weekday_data.items())
    ]

    weekly_metrics = [
        {"week": week, "total": round(d["total"], 2), "count": d["count"]}
        for week, d in sorted(weekly_data.items())
    ][-24:]

    largest_transactions = sorted(
        [_txn_dict(e) for e in expenses],
        key=lambda x: x["amount"],
        reverse=True,
    )[:5]

    return {
        "weekly_metrics": weekly_metrics,
        "weekday_aggregates": weekday_aggregates,
        "anomaly_candidates": anomaly_candidates[:10],
        "largest_transactions": largest_transactions,
    }
