from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.database.models import User
from app.schemas.common import MessageResponse
from app.schemas.goal import GoalCreate, GoalResponse, GoalUpdate
from app.services.auth_service import get_current_user
from app.services.goal_service import (
    create_user_goal,
    delete_user_goal,
    get_user_goal_or_404,
    get_user_goals,
    update_user_goal,
)

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.get("", response_model=list[GoalResponse])
def list_goals_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_goals(db, current_user.id)


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal_route(
    data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_user_goal(
        db, current_user.id, data.name, data.target_amount, data.current_amount, data.target_date
    )


@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal_route(
    goal_id: int,
    data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = get_user_goal_or_404(db, current_user.id, goal_id)
    return update_user_goal(db, goal, data.current_amount, data.target_amount, data.target_date)


@router.delete("/{goal_id}", response_model=MessageResponse)
def delete_goal_route(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = get_user_goal_or_404(db, current_user.id, goal_id)
    delete_user_goal(db, goal)
    return {"message": "Goal deleted"}
