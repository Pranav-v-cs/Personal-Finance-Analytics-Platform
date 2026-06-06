import pytest
from fastapi import status


class TestCreateBudget:
    def test_create_valid(self, client, auth_headers):
        response = client.post("/budgets", json={
            "category": "Entertainment",
            "monthly_limit": 300.00,
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["category"] == "Entertainment"
        assert data["monthly_limit"] == "300.00"

    def test_create_duplicate_category(self, client, auth_headers, sample_budgets):
        response = client.post("/budgets", json={
            "category": "Food",
            "monthly_limit": 600.00,
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_409_CONFLICT

    def test_create_unauthorized(self, client):
        response = client.post("/budgets", json={
            "category": "Entertainment",
            "monthly_limit": 300.00,
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestListBudgets:
    def test_list_empty(self, client, auth_headers):
        response = client.get("/budgets", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_list_with_data(self, client, auth_headers, sample_budgets):
        response = client.get("/budgets", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 3
        for b in data:
            assert "current_spend" in b

    def test_list_unauthorized(self, client):
        response = client.get("/budgets")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUpdateBudget:
    def test_update_limit(self, client, auth_headers, sample_budgets):
        bid = sample_budgets[0].id
        response = client.put(f"/budgets/{bid}", json={
            "monthly_limit": 750.00,
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["monthly_limit"] == "750.00"

    def test_update_nonexistent(self, client, auth_headers):
        response = client.put("/budgets/99999", json={
            "monthly_limit": 500.00,
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_unauthorized(self, client, sample_budgets):
        response = client.put(f"/budgets/{sample_budgets[0].id}", json={
            "monthly_limit": 500.00,
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestDeleteBudget:
    def test_delete_existing(self, client, auth_headers, sample_budgets):
        bid = sample_budgets[0].id
        response = client.delete(f"/budgets/{bid}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["message"] == "Budget deleted"

    def test_delete_nonexistent(self, client, auth_headers):
        response = client.delete("/budgets/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_unauthorized(self, client, sample_budgets):
        response = client.delete(f"/budgets/{sample_budgets[0].id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
