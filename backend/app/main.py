from fastapi import FastAPI

from app.database.database import engine
from app.database.models import Base
from app.routers.auth import router as auth_router
from app.routers.expenses import router as expenses_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router)
app.include_router(expenses_router)

@app.get("/")
def root():
    return {"message": "Personal Finance Analytics API"}
