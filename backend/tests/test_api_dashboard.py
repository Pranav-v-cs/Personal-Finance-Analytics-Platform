import pytest
from fastapi import status


class TestDashboardSummary:
    def test_empty(self, client, auth_headers):
        response = client.get("/dashboard/summary", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total_expenses"] == "0.00"
        assert data["expense_count"] == 0

    def test_with_data(self, client, auth_headers, sample_expenses):
        response = client.get("/dashboard/summary", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["expense_count"] == 5
        assert data["top_category"] is not None

    def test_unauthorized(self, client):
        response = client.get("/dashboard/summary")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestDashboardMonthly:
    def test_empty(self, client, auth_headers):
        response = client.get("/dashboard/monthly", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_with_data(self, client, auth_headers, sample_expenses):
        response = client.get("/dashboard/monthly", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) > 0

    def test_unauthorized(self, client):
        response = client.get("/dashboard/monthly")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestDashboardCategories:
    def test_empty(self, client, auth_headers):
        response = client.get("/dashboard/categories", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_with_data(self, client, auth_headers, sample_expenses):
        response = client.get("/dashboard/categories", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 4

    def test_unauthorized(self, client):
        response = client.get("/dashboard/categories")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestDashboardRecent:
    def test_empty(self, client, auth_headers):
        response = client.get("/dashboard/recent", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_with_data(self, client, auth_headers, sample_expenses):
        response = client.get("/dashboard/recent", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) > 0

    def test_unauthorized(self, client):
        response = client.get("/dashboard/recent")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestDashboardCategoryMonthly:
    def test_empty(self, client, auth_headers):
        response = client.get("/dashboard/category-monthly", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_with_data(self, client, auth_headers, sample_expenses):
        response = client.get("/dashboard/category-monthly", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) > 0

    def test_unauthorized(self, client):
        response = client.get("/dashboard/category-monthly")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestDashboardAnalytics:
    def test_empty(self, client, auth_headers):
        response = client.get("/dashboard/analytics", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["weekly_metrics"] == []
        assert data["anomaly_candidates"] == []
        assert data["largest_transactions"] == []

    def test_with_data(self, client, auth_headers, sample_expenses):
        response = client.get("/dashboard/analytics", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["weekly_metrics"]) > 0
        assert len(data["anomaly_candidates"]) > 0
        assert len(data["largest_transactions"]) > 0

    def test_unauthorized(self, client):
        response = client.get("/dashboard/analytics")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
