from decimal import Decimal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from contextlib import asynccontextmanager
import asyncio
import logging
import random

from .config import settings
from .routes.auth import router as auth_router
from .routes.account import router as account_router
from .routes.stocks import router as stocks_router
from .routes.trade import router as buy_router
from .dependencies import get_current_user
from .routes.portfolio import router as portfolio_router
from .routes.transactions import router as transactions_router
from .routes.health import router as health_router
from .db import engine, SessionLocal
from .models import Stock
from sqlalchemy import text

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def _market_simulator_task(stop_event: asyncio.Event):
    """Background task that nudges stock prices every 15 seconds."""
    while not stop_event.is_set():
        await asyncio.sleep(15)
        try:
            session = SessionLocal()
            stocks = session.query(Stock).all()
            for stock in stocks:
                drift = random.uniform(-0.015, 0.015)
                stock.price = max(Decimal('0.01'), stock.price * Decimal(str(1 + drift)))
            session.commit()
        except Exception as e:
            logger.error(f"Market simulator failed: {e}")
            session.rollback()
        finally:
            session.close()


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

    stop_event = asyncio.Event()
    market_task = asyncio.create_task(_market_simulator_task(stop_event))
    logger.info("🚀 Market simulator started")
    
    yield

    logger.info("Shutting down...")
    stop_event.set()
    market_task.cancel()
    try:
        await market_task
    except asyncio.CancelledError:
        pass
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
