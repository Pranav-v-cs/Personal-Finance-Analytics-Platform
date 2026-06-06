from datetime import datetime, timedelta

import pytest

from app.services.dashboard_service import (
    get_dashboard_summary,
    get_monthly_spending,
    get_dashboard_categories,
    get_dashboard_recent,
    get_category_monthly,
    get_analytics,
)


class TestDashboardSummary:
    def test_empty_user(self, db, test_user):
        result = get_dashboard_summary(db, test_user.id)
        assert result["total_expenses"] == 0
        assert result["expense_count"] == 0
        assert result["avg_per_day"] == 0
        assert result["top_category"] is None
        assert result["category_breakdown"] == []

    def test_with_expenses(self, db, test_user, sample_expenses):
        result = get_dashboard_summary(db, test_user.id)
        assert result["total_expenses"] > 0
        assert result["expense_count"] == 5
        assert result["avg_per_day"] > 0
        assert result["top_category"] is not None
        assert "category" in result["top_category"]
        assert len(result["category_breakdown"]) == 4

    def test_other_user_sees_nothing(self, db, test_user, other_user, sample_expenses):
        result = get_dashboard_summary(db, other_user.id)
        assert result["total_expenses"] == 0
        assert result["expense_count"] == 0


class TestMonthlySpending:
    def test_empty(self, db, test_user):
        result = get_monthly_spending(db, test_user.id)
        assert result == []

    def test_with_expenses(self, db, test_user, sample_expenses):
        result = get_monthly_spending(db, test_user.id)
        assert len(result) > 0
        assert result[0]["total_amount"] > 0
        assert "month" in result[0]


class TestDashboardCategories:
    def test_empty(self, db, test_user):
        result = get_dashboard_categories(db, test_user.id)
        assert result == []

    def test_with_expenses(self, db, test_user, sample_expenses):
        result = get_dashboard_categories(db, test_user.id)
        assert len(result) == 4
        for cat in result:
            assert "category" in cat
            assert "total" in cat
            assert "percent" in cat
        assert sum(c["percent"] for c in result) == pytest.approx(100, 1)

    def test_percentages_sum_to_100(self, db, test_user, sample_expenses):
        result = get_dashboard_categories(db, test_user.id)
        total = sum(c["percent"] for c in result)
        assert total == pytest.approx(100, 1)


class TestDashboardRecent:
    def test_empty(self, db, test_user):
        result = get_dashboard_recent(db, test_user.id)
        assert result == []

    def test_returns_limit(self, db, test_user, sample_expenses):
        result = get_dashboard_recent(db, test_user.id)
        assert len(result) <= 5

    def test_title_from_description(self, db, test_user, sample_expenses):
        result = get_dashboard_recent(db, test_user.id)
        for r in result:
            assert "title" in r
            assert isinstance(r["title"], str)


class TestCategoryMonthly:
    def test_empty(self, db, test_user):
        result = get_category_monthly(db, test_user.id)
        assert result == []

    def test_with_expenses(self, db, test_user, sample_expenses):
        result = get_category_monthly(db, test_user.id)
        assert len(result) > 0
        for r in result:
            assert "month" in r
            assert "category" in r
            assert "total_amount" in r


class TestAnalytics:
    def test_empty_returns_empty_lists(self, db, test_user):
        result = get_analytics(db, test_user.id)
        assert result["weekly_metrics"] == []
        assert result["weekday_aggregates"] == []
        assert result["anomaly_candidates"] == []

    def test_with_expenses(self, db, test_user, sample_expenses):
        result = get_analytics(db, test_user.id)
        assert len(result["weekly_metrics"]) > 0
        assert len(result["weekday_aggregates"]) > 0
        assert len(result["anomaly_candidates"]) > 0

    def test_anomaly_candidates_ordered_by_z_score(self, db, test_user, sample_expenses):
        result = get_analytics(db, test_user.id)
        candidates = result["anomaly_candidates"]
        if len(candidates) >= 2:
            z_scores = [c["z_score"] for c in candidates]
            assert abs(z_scores[0]) >= abs(z_scores[1])

    def test_anomaly_high_value_detected(self, db, test_user, sample_expenses):
        result = get_analytics(db, test_user.id)
        candidates = result["anomaly_candidates"]
        laptop_anomalies = [c for c in candidates if c["category"] == "Electronics" and c["amount"] > 5000]
        assert len(laptop_anomalies) > 0

    def test_largest_transactions_included(self, db, test_user, sample_expenses):
        result = get_analytics(db, test_user.id)
        assert "largest_transactions" in result
        assert len(result["largest_transactions"]) > 0
        assert result["largest_transactions"][0]["amount"] == 9999.99

    def test_top_five_largest(self, db, test_user, sample_expenses):
        from app.services.dashboard_service import get_analytics
        result = get_analytics(db, test_user.id)
        assert len(result["largest_transactions"]) <= 5

    def test_weekday_aggregates_structure(self, db, test_user, sample_expenses):
        result = get_analytics(db, test_user.id)
        for day_data in result["weekday_aggregates"]:
            assert "day" in day_data
            assert "total" in day_data
            assert "count" in day_data
            assert "avg" in day_data
