from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models import Account, Portfolio, User, Stock, Transaction as TransactionModel
from app.schemas import PortfolioItem, SellResponse, TradeRequest, BuyResponse 

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/", response_model=list[PortfolioItem])
def get_portfolio(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    portfolio_entries = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    result = []
    
    for entry in portfolio_entries:
        stock = db.query(Stock).filter(Stock.symbol == entry.stock_symbol).first()
        market_value = entry.quantity * stock.price
        profit_loss = (stock.price - entry.avg_buy_price) * entry.quantity
        if stock:
            result.append(PortfolioItem(
                symbol=entry.stock_symbol,
                quantity=entry.quantity,
                avg_buy_price=float(entry.avg_buy_price),
                current_price=float(stock.price),
                market_value=float(market_value),
                profit_loss=float(profit_loss)
            ))
    return result