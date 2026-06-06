from decimal import Decimal

import pytest
from fastapi import HTTPException

from app.services.budget_service import (
    get_user_budgets,
    get_user_budget_or_404,
    create_user_budget,
    update_user_budget,
    delete_user_budget,
)


class TestCreateBudget:
    def test_create_valid(self, db, test_user):
        budget = create_user_budget(db, test_user.id, "Food", Decimal("500.00"))
        assert budget.id is not None
        assert budget.category == "Food"
        assert float(budget.monthly_limit) == 500.00

    def test_create_duplicate_category_raises(self, db, test_user, sample_budgets):
        with pytest.raises(HTTPException) as exc:
            create_user_budget(db, test_user.id, "Food", Decimal("600.00"))
        assert exc.value.status_code == 409
        assert "already exists" in exc.value.detail

    def test_create_other_user_can_duplicate_category(self, db, test_user, other_user, sample_budgets):
        budget = create_user_budget(db, other_user.id, "Food", Decimal("300.00"))
        assert budget.id is not None

    def test_create_zero_limit(self, db, test_user):
        budget = create_user_budget(db, test_user.id, "Misc", Decimal("0"))
        assert float(budget.monthly_limit) == 0


class TestListBudgets:
    def test_empty(self, db, test_user):
        result = get_user_budgets(db, test_user.id)
        assert result == []

    def test_returns_budgets(self, db, test_user, sample_budgets):
        result = get_user_budgets(db, test_user.id)
        assert len(result) == 3

    def test_other_user_sees_nothing(self, db, test_user, other_user, sample_budgets):
        result = get_user_budgets(db, other_user.id)
        assert result == []

    def test_current_spend_computed(self, db, test_user, sample_budgets, sample_expenses):
        result = get_user_budgets(db, test_user.id)
        food_budget = [b for b in result if b["category"] == "Food"][0]
        assert float(food_budget["current_spend"]) >= 0


class TestGetBudgetOr404:
    def test_existing(self, db, test_user, sample_budgets):
        budget = get_user_budget_or_404(db, test_user.id, sample_budgets[0].id)
        assert budget is not None

    def test_nonexistent_raises(self, db, test_user):
        with pytest.raises(HTTPException) as exc:
            get_user_budget_or_404(db, test_user.id, 99999)
        assert exc.value.status_code == 404

    def test_other_user_raises(self, db, test_user, other_user, sample_budgets):
        with pytest.raises(HTTPException) as exc:
            get_user_budget_or_404(db, other_user.id, sample_budgets[0].id)
        assert exc.value.status_code == 404


class TestUpdateBudget:
    def test_update_limit(self, db, test_user, sample_budgets):
        budget = sample_budgets[0]
        updated = update_user_budget(db, budget, Decimal("750.00"))
        assert float(updated.monthly_limit) == 750.00


class TestDeleteBudget:
    def test_delete_removes(self, db, test_user, sample_budgets):
        delete_user_budget(db, sample_budgets[0])
        result = get_user_budgets(db, test_user.id)
        assert len(result) == 2

    def test_delete_all(self, db, test_user, sample_budgets):
        for b in sample_budgets:
            delete_user_budget(db, b)
        result = get_user_budgets(db, test_user.id)
        assert result == []
