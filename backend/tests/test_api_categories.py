import pytest
from fastapi import status


class TestListCategories:
    def test_returns_default_categories(self, client):
        response = client.get("/categories")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 7
        assert "Food" in data
        assert "Transport" in data
        assert "Bills" in data
        assert "Shopping" in data
        assert "Entertainment" in data
        assert "Healthcare" in data
        assert "Other" in data

    def test_structure_is_list_of_strings(self, client):
        response = client.get("/categories")
        data = response.json()
        for item in data:
            assert isinstance(item, str)
