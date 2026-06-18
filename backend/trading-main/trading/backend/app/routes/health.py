from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..db import get_db

router = APIRouter(tags=["health"])


def _check_db_connection(db: Session) -> bool:
    """Check if database connection is alive."""
    try:
        db.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint for Render deployment."""
    if _check_db_connection(db):
        return {"status": "ok", "database": "connected"}
    return {"status": "error", "database": "disconnected"}


@router.get("/health/db")
def health_db_only(db: Session = Depends(get_db)):
    """Simple database health check."""
    return {"status": "ok" if _check_db_connection(db) else "error"}