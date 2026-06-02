from fastapi import FastAPI

from app.database.database import engine
from app.database.models import Base
from app.routers.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Personal Finance Analytics API"}