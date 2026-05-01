from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint for Render deployment.
    Returns ok if the service is running and DB is reachable.
    """
    try:
        # Verify database connection
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": "disconnected", "detail": str(e)}


@router.get("/health/db")
def health_db_only(db: Session = Depends(get_db)):
    """Simple database health check."""
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception:
        return {"status": "error"}