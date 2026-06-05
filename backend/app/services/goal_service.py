from datetime import date, datetime
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import Goal


def get_user_goals(db: Session, user_id: int) -> list[dict]:
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == user_id)
        .order_by(Goal.created_at.desc())
        .all()
    )
    return [
        {
            "id": g.id,
            "name": g.name,
            "target_amount": g.target_amount,
            "current_amount": g.current_amount,
            "target_date": g.target_date.isoformat() if g.target_date else None,
            "created_at": g.created_at.isoformat() if g.created_at else "",
        }
        for g in goals
    ]


def get_user_goal_or_404(db: Session, user_id: int, goal_id: int) -> Goal:
    goal = (
        db.query(Goal)
        .filter(Goal.id == goal_id, Goal.user_id == user_id)
        .first()
    )
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal


def create_user_goal(
    db: Session,
    user_id: int,
    name: str,
    target_amount: Decimal,
    current_amount: Decimal,
    target_date: str | None,
) -> Goal:
    parsed_date = None
    if target_date:
        try:
            parsed_date = datetime.strptime(target_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    goal = Goal(
        user_id=user_id,
        name=name,
        target_amount=target_amount,
        current_amount=current_amount,
        target_date=parsed_date,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def update_user_goal(
    db: Session,
    goal: Goal,
    current_amount: Decimal | None,
    target_amount: Decimal | None,
    target_date: str | None,
) -> Goal:
    if current_amount is not None:
        goal.current_amount = current_amount
    if target_amount is not None:
        goal.target_amount = target_amount
    if target_date is not None:
        try:
            goal.target_date = datetime.strptime(target_date, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    db.commit()
    db.refresh(goal)
    return goal


def delete_user_goal(db: Session, goal: Goal) -> None:
    db.delete(goal)
    db.commit()
