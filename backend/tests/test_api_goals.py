import pytest
from fastapi import status


class TestCreateGoal:
    def test_create_valid(self, client, auth_headers):
        response = client.post("/goals", json={
            "name": "New Goal",
            "target_amount": 5000.00,
            "current_amount": 0.00,
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["name"] == "New Goal"
        assert data["target_amount"] == "5000.00"

    def test_create_with_target_date(self, client, auth_headers):
        response = client.post("/goals", json={
            "name": "Vacation",
            "target_amount": 10000.00,
            "current_amount": 1000.00,
            "target_date": "2026-12-31",
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["target_date"] == "2026-12-31"

    def test_create_invalid_date(self, client, auth_headers):
        response = client.post("/goals", json={
            "name": "Bad Date",
            "target_amount": 1000.00,
            "current_amount": 0.00,
            "target_date": "not-a-date",
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_unauthorized(self, client):
        response = client.post("/goals", json={
            "name": "Unauthorized",
            "target_amount": 1000.00,
            "current_amount": 0.00,
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestListGoals:
    def test_list_empty(self, client, auth_headers):
        response = client.get("/goals", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []

    def test_list_with_data(self, client, auth_headers, sample_goals):
        response = client.get("/goals", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 3

    def test_list_unauthorized(self, client):
        response = client.get("/goals")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUpdateGoal:
    def test_update_current_amount(self, client, auth_headers, sample_goals):
        gid = sample_goals[0].id
        response = client.put(f"/goals/{gid}", json={
            "current_amount": 7500.00,
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["current_amount"] == "7500.00"

    def test_update_invalid_date(self, client, auth_headers, sample_goals):
        gid = sample_goals[0].id
        response = client.put(f"/goals/{gid}", json={
            "target_date": "invalid",
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_update_nonexistent(self, client, auth_headers):
        response = client.put("/goals/99999", json={
            "current_amount": 100.00,
        }, headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_unauthorized(self, client, sample_goals):
        response = client.put(f"/goals/{sample_goals[0].id}", json={
            "current_amount": 100.00,
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestDeleteGoal:
    def test_delete_existing(self, client, auth_headers, sample_goals):
        gid = sample_goals[0].id
        response = client.delete(f"/goals/{gid}", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["message"] == "Goal deleted"

    def test_delete_nonexistent(self, client, auth_headers):
        response = client.delete("/goals/99999", headers=auth_headers)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_delete_unauthorized(self, client, sample_goals):
        response = client.delete(f"/goals/{sample_goals[0].id}")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
