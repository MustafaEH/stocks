from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.routes.auth import router as auth_router
from app.routes.account import router as account_router
from app.routes.stocks import router as stocks_router
from app.routes.trade import router as buy_router
from app.dependencies import get_current_user
from app.routes.portfolio import router as portfolio_router
from app.routes.transactions import router as transactions_router
from app.routes.health import router as health_router
from app.db import engine
from sqlalchemy import text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup: Verify database connection
    logger.info("Starting up...")
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection verified successfully")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(title="Trading API", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(account_router)
    app.include_router(stocks_router)
    app.include_router(buy_router)
    app.include_router(portfolio_router)
    app.include_router(transactions_router)
    return app
