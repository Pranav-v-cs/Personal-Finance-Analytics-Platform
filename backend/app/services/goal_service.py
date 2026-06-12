import logging
from datetime import date, datetime
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database.models import Goal

logger = logging.getLogger(__name__)


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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Goal with ID {goal_id} was not found. "
                   "It may have been deleted or you may not have access to it.",
        )
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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid date format: '{target_date}'. Please use YYYY-MM-DD format (e.g., 2025-12-31).",
            )

    goal = Goal(
        user_id=user_id,
        name=name,
        target_amount=target_amount,
        current_amount=current_amount,
        target_date=parsed_date,
    )
    db.add(goal)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error("Failed to create goal for user %d: %s", user_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save the financial goal due to a database error. Please try again.",
        )
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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid date format: '{target_date}'. Please use YYYY-MM-DD format (e.g., 2025-12-31).",
            )
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error("Failed to update goal %d: %s", goal.id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update the financial goal due to a database error. Please try again.",
        )
    db.refresh(goal)
    return goal


def delete_user_goal(db: Session, goal: Goal) -> None:
    db.delete(goal)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error("Failed to delete goal %d: %s", goal.id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete the financial goal due to a database error. Please try again.",
        )
