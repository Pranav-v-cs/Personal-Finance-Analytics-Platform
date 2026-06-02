from fastapi import FastAPI

from app.database.database import engine
from app.database.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Personal Finance Analytics API"}