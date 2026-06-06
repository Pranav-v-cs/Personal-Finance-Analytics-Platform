import os

os.environ["SECRET_KEY"] = "test-secret-key-not-for-production"
os.environ["ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"
os.environ["DATABASE_URL"] = "sqlite:///./test_finlytics.db"
os.environ["OPENROUTER_API_KEY"] = "sk-test-mock-key"

from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.database import Base, get_db
from app.main import app
from app.core.security import create_access_token, hash_password


TEST_DB_URL = "sqlite:///./test_finlytics.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def _get_db():
        yield db

    app.dependency_overrides[get_db] = _get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db):
    from app.database.models import User

    user = User(
        name="Test User",
        email="test@example.com",
        hashed_password=hash_password("password123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_headers(test_user):
    token = create_access_token({"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def other_user(db):
    from app.database.models import User

    user = User(
        name="Other User",
        email="other@example.com",
        hashed_password=hash_password("password123"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def other_auth_headers(other_user):
    token = create_access_token({"sub": str(other_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="function")
def sample_expenses(db, test_user):
    from datetime import datetime
    from app.database.models import Expense

    expenses = [
        Expense(
            user_id=test_user.id,
            amount=50.00,
            category="Food",
            description="Lunch",
            transaction_date=datetime.now() - timedelta(days=1),
        ),
        Expense(
            user_id=test_user.id,
            amount=1200.00,
            category="Rent",
            description="Monthly rent",
            transaction_date=datetime.now() - timedelta(days=5),
        ),
        Expense(
            user_id=test_user.id,
            amount=30.00,
            category="Transport",
            description="Uber",
            transaction_date=datetime.now() - timedelta(days=2),
        ),
        Expense(
            user_id=test_user.id,
            amount=200.00,
            category="Food",
            description="Groceries",
            transaction_date=datetime.now() - timedelta(days=3),
        ),
        Expense(
            user_id=test_user.id,
            amount=9999.99,
            category="Electronics",
            description="Laptop purchase",
            transaction_date=datetime.now() - timedelta(days=4),
        ),
    ]
    for e in expenses:
        db.add(e)
    db.commit()
    for e in expenses:
        db.refresh(e)
    return expenses


@pytest.fixture(scope="function")
def sample_budgets(db, test_user):
    from app.database.models import Budget

    budgets = [
        Budget(user_id=test_user.id, category="Food", monthly_limit=500.00),
        Budget(user_id=test_user.id, category="Rent", monthly_limit=1500.00),
        Budget(user_id=test_user.id, category="Transport", monthly_limit=200.00),
    ]
    for b in budgets:
        db.add(b)
    db.commit()
    for b in budgets:
        db.refresh(b)
    return budgets


@pytest.fixture(scope="function")
def sample_goals(db, test_user):
    from datetime import date
    from app.database.models import Goal

    goals = [
        Goal(
            user_id=test_user.id,
            name="Emergency Fund",
            target_amount=10000.00,
            current_amount=5000.00,
            target_date=date(2026, 12, 31),
        ),
        Goal(
            user_id=test_user.id,
            name="Vacation",
            target_amount=3000.00,
            current_amount=3000.00,
            target_date=date(2026, 6, 30),
        ),
        Goal(
            user_id=test_user.id,
            name="New Laptop",
            target_amount=2500.00,
            current_amount=1000.00,
            target_date=None,
        ),
    ]
    for g in goals:
        db.add(g)
    db.commit()
    for g in goals:
        db.refresh(g)
    return goals
