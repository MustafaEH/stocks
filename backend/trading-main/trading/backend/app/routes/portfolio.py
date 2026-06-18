from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import get_current_user
from ..models import Portfolio, User, Stock
from ..schemas import PortfolioItem

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


import time

@router.get("/", response_model=list[PortfolioItem])
def get_portfolio(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    start = time.time()

    results = db.query(Portfolio, Stock)\
        .join(Stock, Portfolio.stock_symbol == Stock.symbol)\
        .filter(Portfolio.user_id == current_user.id)\
        .all()

    result = []
    for portfolio_entry, stock in results:
        market_value = portfolio_entry.quantity * stock.price
        profit_loss = (stock.price - portfolio_entry.avg_buy_price) * portfolio_entry.quantity
        result.append(PortfolioItem(
            symbol=portfolio_entry.stock_symbol,
            quantity=portfolio_entry.quantity,
            avg_buy_price=float(portfolio_entry.avg_buy_price),
            current_price=float(stock.price),
            market_value=float(market_value),
            profit_loss=float(profit_loss)
        ))

    elapsed = (time.time() - start) * 1000
    print(f"AFTER — {len(results)} stocks — {elapsed:.2f}ms — 1 query")
    return result