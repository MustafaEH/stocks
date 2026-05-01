from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from app.routes.auth import router as auth_router
from app.routes.account import router as account_router
from app.routes.stocks import router as stocks_router
from app.routes.trade import router as buy_router
from app.dependencies import get_current_user
from app.routes.portfolio import router as portfolio_router
from app.routes.transactions import router as transactions_router

def create_app() -> FastAPI:
    app = FastAPI(title="Trading API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "http://127.0.0.1:8080"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router)
    app.include_router(account_router)
    app.include_router(stocks_router)
    app.include_router(buy_router)
    app.include_router(portfolio_router)
    app.include_router(transactions_router)
    return app
