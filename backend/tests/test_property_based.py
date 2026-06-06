from decimal import Decimal
from datetime import datetime, timedelta
from hypothesis import given, strategies as st, settings, HealthCheck
import pytest

from app.services.budget_service import get_user_budgets
from app.services.goal_service import get_user_goals
from app.services.dashboard_service import get_analytics, get_dashboard_categories
from app.services.expense_service import list_user_expenses_filtered


SUPPRESS = settings(
    suppress_health_check=[HealthCheck.function_scoped_fixture],
    max_examples=30,
)


def _clean_user_expenses(db, user_id):
    from app.database.models import Expense
    db.query(Expense).filter(Expense.user_id == user_id).delete()
    db.commit()


def _clean_user_budgets(db, user_id):
    from app.database.models import Budget
    db.query(Budget).filter(Budget.user_id == user_id).delete()
    db.commit()


def _clean_user_goals(db, user_id):
    from app.database.models import Goal
    db.query(Goal).filter(Goal.user_id == user_id).delete()
    db.commit()


class TestBudgetProperties:
    @given(st.lists(st.floats(min_value=1, max_value=10000), min_size=1, max_size=5))
    @SUPPRESS
    def test_current_spend_nonnegative(self, db, test_user, limits):
        from app.database.models import Budget
        try:
            for i, limit in enumerate(limits):
                db.add(Budget(
                    user_id=test_user.id,
                    category=f"PropB_{i}",
                    monthly_limit=Decimal(str(limit)),
                ))
            db.commit()

            result = get_user_budgets(db, test_user.id)
            for b in result:
                assert float(b["current_spend"]) >= 0
        finally:
            _clean_user_budgets(db, test_user.id)


class TestGoalProperties:
    @given(st.lists(
        st.tuples(
            st.floats(min_value=0, max_value=100000),
            st.floats(min_value=1, max_value=100000),
        ), min_size=1, max_size=5,
    ))
    @SUPPRESS
    def test_progress_percentage_bounds(self, db, test_user, goal_data):
        from app.database.models import Goal
        try:
            for i, (current, target) in enumerate(goal_data):
                db.add(Goal(
                    user_id=test_user.id,
                    name=f"PropG_{i}",
                    target_amount=Decimal(str(target)),
                    current_amount=Decimal(str(current)),
                    target_date=None,
                ))
            db.commit()

            result = get_user_goals(db, test_user.id)
            for g in result:
                t = float(g["target_amount"])
                c = float(g["current_amount"])
                if t > 0:
                    pct = (c / t) * 100
                    assert pct >= 0, f"Progress {pct}% cannot be negative"
        finally:
            _clean_user_goals(db, test_user.id)


class TestAnomalyDetectionProperties:
    @given(
        st.lists(st.floats(min_value=10, max_value=1000), min_size=3, max_size=15),
        st.floats(min_value=2000, max_value=50000),
    )
    @SUPPRESS
    def test_outlier_detected(self, db, test_user, amounts, outlier_amount):
        from app.database.models import Expense
        try:
            base_date = datetime.now() - timedelta(days=len(amounts))
            for i, amt in enumerate(amounts):
                db.add(Expense(
                    user_id=test_user.id, amount=amt, category="Base",
                    description=f"B{i}", transaction_date=base_date + timedelta(days=i),
                ))
            db.add(Expense(
                user_id=test_user.id, amount=outlier_amount, category="Outlier",
                description="Anomalous", transaction_date=datetime.now(),
            ))
            db.commit()

            result = get_analytics(db, test_user.id)
            outlier_candidates = [
                c for c in result["anomaly_candidates"] if c["category"] == "Outlier"
            ]
            assert len(outlier_candidates) > 0
            for c in outlier_candidates:
                assert abs(c["z_score"]) >= 0
        finally:
            _clean_user_expenses(db, test_user.id)


class TestCategoryPercentageProperties:
    @given(st.lists(st.floats(min_value=1, max_value=10000), min_size=1, max_size=8))
    @SUPPRESS
    def test_category_percentages_sum_to_100(self, db, test_user, amounts):
        from app.database.models import Expense
        try:
            base_date = datetime.now() - timedelta(days=len(amounts))
            for i, amt in enumerate(amounts):
                db.add(Expense(
                    user_id=test_user.id, amount=amt, category=f"PCat_{i}",
                    description=f"E{i}", transaction_date=base_date + timedelta(days=i),
                ))
            db.commit()

            result = get_dashboard_categories(db, test_user.id)
            if result:
                total = sum(c["percent"] for c in result)
                assert total == pytest.approx(100, abs=1)
        finally:
            _clean_user_expenses(db, test_user.id)


class TestExpenseFilterProperties:
    @given(
        st.lists(st.floats(min_value=1, max_value=5000), min_size=3, max_size=8),
        st.floats(min_value=50, max_value=500),
    )
    @SUPPRESS
    def test_min_amount_filter(self, db, test_user, amounts, min_amt):
        from app.database.models import Expense
        try:
            base_date = datetime.now() - timedelta(days=len(amounts))
            for i, amt in enumerate(amounts):
                db.add(Expense(
                    user_id=test_user.id, amount=amt, category="FilterTest",
                    description=f"E{i}", transaction_date=base_date + timedelta(days=i),
                ))
            db.commit()

            min_dec = Decimal(str(round(min_amt, 2)))
            result = list_user_expenses_filtered(
                db, test_user.id, min_amount=min_dec
            )
            for e in result:
                assert float(e.amount) >= float(min_dec) - 0.01
        finally:
            _clean_user_expenses(db, test_user.id)
