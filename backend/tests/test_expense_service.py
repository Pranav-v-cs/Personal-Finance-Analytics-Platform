from decimal import Decimal
from datetime import date

import pytest
from fastapi import HTTPException

from app.services.expense_service import (
    create_expense,
    list_user_expenses_filtered,
    get_user_expense,
    get_user_expense_or_404,
    update_user_expense,
    delete_user_expense,
)
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


class TestCreateExpense:
    def test_create_valid(self, db, test_user):
        data = ExpenseCreate(
            amount=Decimal("100.00"),
            category="Food",
            description="Test expense",
        )
        expense = create_expense(db, test_user.id, data)
        assert expense.id is not None
        assert float(expense.amount) == 100.00
        assert expense.category == "Food"

    def test_create_minimal(self, db, test_user):
        data = ExpenseCreate(amount=Decimal("50.00"), category="Transport")
        expense = create_expense(db, test_user.id, data)
        assert expense.id is not None

    def test_create_zero_amount_raises(self, db, test_user):
        with pytest.raises(Exception):
            ExpenseCreate(amount=Decimal("0"), category="Food")

    def test_create_negative_raises(self, db, test_user):
        with pytest.raises(Exception):
            ExpenseCreate(amount=Decimal("-50.00"), category="Food")


class TestListExpensesFiltered:
    def test_empty_user(self, db, test_user):
        result = list_user_expenses_filtered(db, test_user.id)
        assert result == []

    def test_all_expenses(self, db, test_user, sample_expenses):
        result = list_user_expenses_filtered(db, test_user.id)
        assert len(result) == 5

    def test_filter_by_category(self, db, test_user, sample_expenses):
        result = list_user_expenses_filtered(db, test_user.id, category="Food")
        assert len(result) == 2
        assert all(e.category == "Food" for e in result)

    def test_filter_by_date_range(self, db, test_user, sample_expenses):
        from datetime import date
        start = date.today() - timedelta(days=4)
        end = date.today() - timedelta(days=2)
        result = list_user_expenses_filtered(db, test_user.id, start_date=start, end_date=end)
        assert len(result) > 0

    def test_filter_by_min_amount(self, db, test_user, sample_expenses):
        result = list_user_expenses_filtered(db, test_user.id, min_amount=Decimal("500.00"))
        assert all(float(e.amount) >= 500 for e in result)

    def test_filter_by_max_amount(self, db, test_user, sample_expenses):
        result = list_user_expenses_filtered(db, test_user.id, max_amount=Decimal("100.00"))
        assert all(float(e.amount) <= 100 for e in result)

    def test_filter_date_invalid_order_raises(self, db, test_user):
        from datetime import date
        with pytest.raises(HTTPException) as exc:
            list_user_expenses_filtered(
                db, test_user.id,
                start_date=date(2024, 12, 31),
                end_date=date(2024, 1, 1),
            )
        assert exc.value.status_code == 400

    def test_filter_amount_invalid_order_raises(self, db, test_user):
        with pytest.raises(HTTPException) as exc:
            list_user_expenses_filtered(
                db, test_user.id,
                min_amount=Decimal("500"),
                max_amount=Decimal("100"),
            )
        assert exc.value.status_code == 400

    def test_other_user_sees_nothing(self, db, test_user, other_user, sample_expenses):
        result = list_user_expenses_filtered(db, other_user.id)
        assert result == []

    def test_order_desc_by_date(self, db, test_user, sample_expenses):
        result = list_user_expenses_filtered(db, test_user.id)
        dates = [e.transaction_date for e in result]
        assert dates == sorted(dates, reverse=True)


class TestGetExpense:
    def test_get_existing(self, db, test_user, sample_expenses):
        expense = get_user_expense(db, test_user.id, sample_expenses[0].id)
        assert expense is not None
        assert expense.id == sample_expenses[0].id

    def test_get_nonexistent(self, db, test_user):
        expense = get_user_expense(db, test_user.id, 99999)
        assert expense is None

    def test_get_other_user_expense_not_found(self, db, test_user, other_user, sample_expenses):
        expense = get_user_expense(db, other_user.id, sample_expenses[0].id)
        assert expense is None


class TestGetExpenseOr404:
    def test_existing_returns(self, db, test_user, sample_expenses):
        expense = get_user_expense_or_404(db, test_user.id, sample_expenses[0].id)
        assert expense is not None

    def test_nonexistent_raises(self, db, test_user):
        with pytest.raises(HTTPException) as exc:
            get_user_expense_or_404(db, test_user.id, 99999)
        assert exc.value.status_code == 404

    def test_other_user_raises(self, db, test_user, other_user, sample_expenses):
        with pytest.raises(HTTPException) as exc:
            get_user_expense_or_404(db, other_user.id, sample_expenses[0].id)
        assert exc.value.status_code == 404


class TestUpdateExpense:
    def test_update_amount(self, db, test_user, sample_expenses):
        expense = sample_expenses[0]
        updated = update_user_expense(db, expense, ExpenseUpdate(amount=Decimal("75.00")))
        assert float(updated.amount) == 75.00

    def test_update_category(self, db, test_user, sample_expenses):
        expense = sample_expenses[0]
        updated = update_user_expense(db, expense, ExpenseUpdate(category="NewCategory"))
        assert updated.category == "NewCategory"

    def test_update_partial(self, db, test_user, sample_expenses):
        expense = sample_expenses[0]
        updated = update_user_expense(db, expense, ExpenseUpdate(description="Updated desc"))
        assert updated.description == "Updated desc"
        assert float(updated.amount) == float(expense.amount)


class TestDeleteExpense:
    def test_delete_removes(self, db, test_user, sample_expenses):
        expense = sample_expenses[0]
        delete_user_expense(db, expense)
        result = get_user_expense(db, test_user.id, expense.id)
        assert result is None

    def test_delete_reduces_count(self, db, test_user, sample_expenses):
        delete_user_expense(db, sample_expenses[0])
        remaining = list_user_expenses_filtered(db, test_user.id)
        assert len(remaining) == 4


from datetime import timedelta
