from decimal import Decimal

import pytest
from fastapi import status


class TestCreateExpense:
    def test_create_valid(self, client, auth_headers):
        response = client.post("/expenses", json={
            "amount": 100.00,
            "category": "Food",
            "description": "Lunch",
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["amount"] == "100.00"
        assert data["category"] == "Food"

    def test_create_minimal(self, client, auth_headers):
        response = client.post("/expenses", json={
            "amount": 50.00,
            "category": "Transport",
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_negative_amount(self, client, auth_headers):
        response = client.post("/expenses", json={
            "amount": -50.00,
            "category": "Food",
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_create_unauthorized(self, client):
        response = client.post("/expenses", json={
            "amount": 100.00,
            "category": "Food",
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestListExpenses:
    def test_list_empty(self, client, auth_headers):
        response = client.get("/expenses", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_list_with_data(self, client, auth_headers, sample_expenses):
        response = client.get("/expenses", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 5

    def test_list_filter_category(self, client, auth_headers, sample_expenses):
        response = client.get("/expenses?category=Food", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(e["category"] == "Food" for e in data)

    def test_list_filter_amount_range(self, client, auth_headers, sample_expenses):
        response = client.get("/expenses?min_amount=500&max_amount=1000", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert all(float(e["amount"]) >= 500 and float(e["amount"]) <= 1000 for e in data)

    def test_list_filter_reversed_dates(self, client, auth_headers, sample_expenses):
        response = client.get("/expenses?start_date=2025-01-01&end_date=2024-01-01", headers=auth_headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_list_unauthorized(self, client):
        response = client.get("/expenses")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestGetExpense:
    def test_get_existing(self, client, auth_headers, sample_expenses):
        eid = sample_expenses[0].id
        response = client.get(f"/expenses/{eid}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["id"] == eid

    def test_get_nonexistent(self, client, auth_headers):
        response = client.get("/expenses/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_unauthorized(self, client, sample_expenses):
        response = client.get(f"/expenses/{sample_expenses[0].id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUpdateExpense:
    def test_update_amount(self, client, auth_headers, sample_expenses):
        eid = sample_expenses[0].id
        response = client.put(f"/expenses/{eid}", json={
            "amount": 75.00,
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["amount"] == "75.00"

    def test_update_category(self, client, auth_headers, sample_expenses):
        eid = sample_expenses[0].id
        response = client.put(f"/expenses/{eid}", json={
            "category": "UpdatedCat",
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["category"] == "UpdatedCat"

    def test_update_nonexistent(self, client, auth_headers):
        response = client.put("/expenses/99999", json={
            "amount": 100.00,
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_unauthorized(self, client, sample_expenses):
        response = client.put(f"/expenses/{sample_expenses[0].id}", json={
            "amount": 100.00,
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestDeleteExpense:
    def test_delete_existing(self, client, auth_headers, sample_expenses):
        eid = sample_expenses[0].id
        response = client.delete(f"/expenses/{eid}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["message"] == "Expense deleted"

    def test_delete_nonexistent(self, client, auth_headers):
        response = client.delete("/expenses/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_unauthorized(self, client, sample_expenses):
        response = client.delete(f"/expenses/{sample_expenses[0].id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
