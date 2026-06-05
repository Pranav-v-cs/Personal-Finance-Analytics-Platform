from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import engine
from app.database.models import Base
from app.schemas.common import MessageResponse
from app.routers.budgets import router as budgets_router
from app.routers.categories import router as categories_router
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.expenses import router as expenses_router
from app.routers.goals import router as goals_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(expenses_router)
app.include_router(dashboard_router)
app.include_router(categories_router)
app.include_router(budgets_router)
app.include_router(goals_router)

@app.get("/", response_model=MessageResponse)
def root():
    return {"message": "Personal Finance Analytics API"}
