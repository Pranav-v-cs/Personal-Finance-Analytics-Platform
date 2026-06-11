import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.core.config import settings
from app.database.database import engine
from app.database.models import Base
from app.schemas.common import MessageResponse
from app.schemas.error import ValidationErrorResponse
from app.routers import ai, auth, budgets, categories, dashboard, expenses, goals

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(lifespan=lifespan, title="Finlytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=getattr(exc, "headers", None),
    )


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    errors = exc.errors()
    detail = []
    for error in errors:
        field = " -> ".join(str(loc) for loc in error["loc"])
        msg = error["msg"]
        detail.append({"field": field, "message": msg})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": (
                "An unexpected error occurred. "
                "Please try again later. "
                "If the problem persists, contact support."
            )
        },
    )


app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(dashboard.router)
app.include_router(categories.router)
app.include_router(budgets.router)
app.include_router(goals.router)
app.include_router(ai.router)


@app.get("/", response_model=MessageResponse)
def root():
    return {"message": "Personal Finance Analytics API"}


@app.get("/health")
def health():
    return {"status": "ok"}
