from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from urllib.parse import urlparse

from app.config import settings

# Parse the DATABASE_URL to add sslmode if needed for production
def get_database_url() -> str:
    db_url = settings.DATABASE_URL
    
    # If using PostgreSQL and no sslmode specified, add it for production
    if db_url.startswith("postgresql://") and "sslmode" not in db_url:
        # Check if it's not localhost (production)
        parsed = urlparse(db_url)
        if parsed.hostname and parsed.hostname not in ("localhost", "127.0.0.1"):
            # Add sslmode=require for production databases
            separator = "&" if "?" in db_url else "?"
            db_url = f"{db_url}{separator}sslmode=require"
    
    return db_url


engine = create_engine(
    get_database_url(),
    pool_pre_ping=True,  # Verify connections before using
    pool_size=5,
    max_overflow=10,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
