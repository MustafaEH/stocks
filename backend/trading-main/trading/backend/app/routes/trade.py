from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ..db import get_db
from ..dependencies import get_current_user
from ..models import Account, Portfolio, User, Stock, Transaction as TransactionModel
from ..schemas import SellResponse, TradeRequest, BuyResponse

router = APIRouter(prefix="/trade", tags=["trade"])

@router.post("/buy", response_model=BuyResponse)
def buy_stock(
    request: TradeRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        with db.begin_nested():
            stock = db.query(Stock).with_for_update().filter(Stock.symbol == request.symbol.upper()).one_or_none()
            if not stock:
                raise HTTPException(status_code=404, detail="Stock not found")

            account = db.query(Account).with_for_update().filter(Account.user_id == current_user.id).one_or_none()
            if not account:
                raise HTTPException(status_code=404, detail="Account not found")

            if request.quantity <= 0:
                raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

            total_cost = stock.price * request.quantity
            if account.balance < total_cost:
                raise HTTPException(status_code=400, detail="Insufficient funds")

            portfolio_entry = db.query(Portfolio).with_for_update().filter(
                Portfolio.user_id == current_user.id,
                Portfolio.stock_symbol == stock.symbol
            ).one_or_none()

            if portfolio_entry:
                total_quantity = portfolio_entry.quantity + request.quantity
                total_invested = (portfolio_entry.avg_buy_price * portfolio_entry.quantity) + total_cost
                portfolio_entry.avg_buy_price = total_invested / total_quantity
                portfolio_entry.quantity = total_quantity
            else:
                portfolio_entry = Portfolio(
                    user_id=current_user.id,
                    stock_symbol=stock.symbol,
                    quantity=request.quantity,
                    avg_buy_price=stock.price
                )
                db.add(portfolio_entry)

            account.balance -= total_cost
            db.add(new_transaction := TransactionModel(
                user_id=current_user.id,
                symbol=stock.symbol,
                quantity=request.quantity,
                unit_price=stock.price,
                total_price=total_cost,
                transaction_type="BUY",
            ))
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail=f"Failed to record transaction: {str(exc)}")

    try:
        db.refresh(account)
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail=f"Failed to refresh account: {str(exc)}")

    return BuyResponse(
        message="Stock purchased successfully",
        symbol=stock.symbol,
        quantity=request.quantity,
        unit_price=stock.price,
        total_cost=total_cost,
        remaining_balance=account.balance
    )


@router.post("/sell", response_model=SellResponse)
def sell_stock(
    request: TradeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if request.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

    try:
        with db.begin_nested():
            stock = db.query(Stock).with_for_update().filter(Stock.symbol == request.symbol.upper()).one_or_none()
            if not stock:
                raise HTTPException(status_code=404, detail="Stock not found")

            account = db.query(Account).with_for_update().filter(Account.user_id == current_user.id).one_or_none()
            if not account:
                raise HTTPException(status_code=404, detail="Account not found")

            portfolio_entry = db.query(Portfolio).with_for_update().filter(
                Portfolio.user_id == current_user.id,
                Portfolio.stock_symbol == stock.symbol
            ).one_or_none()
            if not portfolio_entry:
                raise HTTPException(status_code=400, detail="You do not own this stock")

            if portfolio_entry.quantity < request.quantity:
                raise HTTPException(status_code=400, detail="Not enough shares to sell")

            total_proceeds = stock.price * request.quantity
            if total_proceeds <= 0:
                raise HTTPException(status_code=400, detail="Invalid proceeds amount")

            portfolio_entry.quantity -= request.quantity
            shares_remaining = portfolio_entry.quantity
            if shares_remaining == 0:
                db.delete(portfolio_entry)

            account.balance += total_proceeds

            db.add(new_transaction := TransactionModel(
                user_id=current_user.id,
                symbol=stock.symbol,
                quantity=request.quantity,
                unit_price=stock.price,
                total_price=total_proceeds,
                transaction_type="SELL",
            ))
    except HTTPException:
        raise
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail=f"Failed to record transaction: {str(exc)}")

    try:
        db.refresh(account)
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=500, detail=f"Failed to refresh account: {str(exc)}")

    return SellResponse(
        message="Stock sold successfully",
        symbol=stock.symbol,
        quantity=request.quantity,
        unit_price=stock.price,
        total_proceeds=total_proceeds,
        remaining_balance=account.balance,
        shares_remaining=shares_remaining,
    )
