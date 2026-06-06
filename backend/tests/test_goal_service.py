from decimal import Decimal
from datetime import date, datetime

import pytest
from fastapi import HTTPException

from app.services.goal_service import (
    get_user_goals,
    get_user_goal_or_404,
    create_user_goal,
    update_user_goal,
    delete_user_goal,
)


class TestCreateGoal:
    def test_create_valid(self, db, test_user):
        goal = create_user_goal(
            db, test_user.id, "Test Goal", Decimal("1000.00"), Decimal("0"), None
        )
        assert goal.id is not None
        assert goal.name == "Test Goal"
        assert float(goal.target_amount) == 1000.00

    def test_create_with_current_amount(self, db, test_user):
        goal = create_user_goal(
            db, test_user.id, "Test Goal", Decimal("1000.00"), Decimal("250.00"), None
        )
        assert float(goal.current_amount) == 250.00

    def test_create_with_target_date(self, db, test_user):
        goal = create_user_goal(
            db, test_user.id, "Test Goal", Decimal("1000.00"), Decimal("0"), "2026-12-31"
        )
        assert goal.target_date == date(2026, 12, 31)

    def test_create_invalid_date_raises(self, db, test_user):
        with pytest.raises(HTTPException) as exc:
            create_user_goal(
                db, test_user.id, "Test Goal", Decimal("1000.00"), Decimal("0"), "not-a-date"
            )
        assert exc.value.status_code == 400

    def test_create_zero_target(self, db, test_user):
        goal = create_user_goal(
            db, test_user.id, "Zero Goal", Decimal("0"), Decimal("0"), None
        )
        assert float(goal.target_amount) == 0


class TestListGoals:
    def test_empty(self, db, test_user):
        result = get_user_goals(db, test_user.id)
        assert result == []

    def test_returns_goals(self, db, test_user, sample_goals):
        result = get_user_goals(db, test_user.id)
        assert len(result) == 3

    def test_other_user_sees_nothing(self, db, test_user, other_user, sample_goals):
        result = get_user_goals(db, other_user.id)
        assert result == []

    def test_goal_structure(self, db, test_user, sample_goals):
        result = get_user_goals(db, test_user.id)
        for g in result:
            assert "id" in g
            assert "name" in g
            assert "target_amount" in g
            assert "current_amount" in g
            assert "target_date" in g

    def test_order_desc_by_created(self, db, test_user, sample_goals):
        result = get_user_goals(db, test_user.id)
        if len(result) > 1:
            dates = [g["created_at"] for g in result]
            assert dates == sorted(dates, reverse=True)


class TestGetGoalOr404:
    def test_existing(self, db, test_user, sample_goals):
        goal = get_user_goal_or_404(db, test_user.id, sample_goals[0].id)
        assert goal is not None

    def test_nonexistent_raises(self, db, test_user):
        with pytest.raises(HTTPException) as exc:
            get_user_goal_or_404(db, test_user.id, 99999)
        assert exc.value.status_code == 404

    def test_other_user_raises(self, db, test_user, other_user, sample_goals):
        with pytest.raises(HTTPException) as exc:
            get_user_goal_or_404(db, other_user.id, sample_goals[0].id)
        assert exc.value.status_code == 404


class TestUpdateGoal:
    def test_update_current_amount(self, db, test_user, sample_goals):
        goal = sample_goals[0]
        updated = update_user_goal(
            db, goal, current_amount=Decimal("7500.00"), target_amount=None, target_date=None
        )
        assert float(updated.current_amount) == 7500.00

    def test_update_target_amount(self, db, test_user, sample_goals):
        goal = sample_goals[0]
        updated = update_user_goal(
            db, goal, current_amount=None, target_amount=Decimal("15000.00"), target_date=None
        )
        assert float(updated.target_amount) == 15000.00

    def test_update_target_date(self, db, test_user, sample_goals):
        goal = sample_goals[0]
        updated = update_user_goal(
            db, goal, current_amount=None, target_amount=None, target_date="2027-01-01"
        )
        assert updated.target_date == date(2027, 1, 1)

    def test_update_invalid_date_raises(self, db, test_user, sample_goals):
        with pytest.raises(HTTPException) as exc:
            update_user_goal(
                db, sample_goals[0],
                current_amount=None, target_amount=None, target_date="invalid"
            )
        assert exc.value.status_code == 400

    def test_update_partial_preserves(self, db, test_user, sample_goals):
        goal = sample_goals[0]
        orig_amount = float(goal.target_amount)
        updated = update_user_goal(
            db, goal, current_amount=Decimal("6000.00"), target_amount=None, target_date=None
        )
        assert float(updated.current_amount) == 6000.00
        assert float(updated.target_amount) == orig_amount


class TestDeleteGoal:
    def test_delete_removes(self, db, test_user, sample_goals):
        delete_user_goal(db, sample_goals[0])
        result = get_user_goals(db, test_user.id)
        assert len(result) == 2

    def test_delete_all(self, db, test_user, sample_goals):
        for g in sample_goals:
            delete_user_goal(db, g)
        result = get_user_goals(db, test_user.id)
        assert result == []
