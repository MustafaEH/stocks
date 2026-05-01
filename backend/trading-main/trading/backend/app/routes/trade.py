from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models import Account, Portfolio, User, Stock, Transaction as TransactionModel
from app.schemas import SellResponse, TradeRequest, BuyResponse

router = APIRouter(prefix="/trade", tags=["buy"])

@router.post("/buy", response_model=BuyResponse)
def buy_stock(
    request: TradeRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    stock = db.query(Stock).filter(Stock.symbol == request.symbol.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    account = db.query(Account).filter(Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if request.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero")
    total_cost = stock.price * request.quantity
    if account.balance < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    new_transaction = TransactionModel(
        user_id=current_user.id,
        symbol=stock.symbol,
        quantity=request.quantity,
        unit_price=stock.price,
        total_price=total_cost,
        transaction_type="BUY",
    )
    portfolio_entry = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id,
        Portfolio.stock_symbol == stock.symbol
    ).first()
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
    db.add(new_transaction)
    try:
        db.commit()
        db.refresh(account)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record transaction: {str(exc)}")
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
    # 1) Validate quantity
    if request.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero"
        )

    # 2) Find stock
    stock = db.query(Stock).filter(
        Stock.symbol == request.symbol.upper()
    ).first()

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Stock not found"
        )

    # 3) Find account
    account = db.query(Account).filter(
        Account.user_id == current_user.id
    ).first()

    if not account:
        raise HTTPException(
            status_code=404,
            detail="Account not found"
        )

    # 4) Find portfolio holding
    portfolio_entry = db.query(Portfolio).filter(
        Portfolio.user_id == current_user.id,
        Portfolio.stock_symbol == stock.symbol
    ).first()

    if not portfolio_entry:
        raise HTTPException(
            status_code=400,
            detail="You do not own this stock"
        )

    # 5) Check enough shares
    if portfolio_entry.quantity < request.quantity:
        raise HTTPException(
            status_code=400,
            detail="Not enough shares to sell"
        )

    # 6) Calculate proceeds
    total_proceeds = stock.price * request.quantity

    # 7) Record transaction
    new_transaction = TransactionModel(
        user_id=current_user.id,
        symbol=stock.symbol,
        quantity=request.quantity,
        unit_price=stock.price,
        total_price=total_proceeds,
        transaction_type="SELL",
    )

    # 8) Update portfolio
    portfolio_entry.quantity -= request.quantity

    shares_remaining = portfolio_entry.quantity

    # if position fully closed -> remove row
    if portfolio_entry.quantity == 0:
        db.delete(portfolio_entry)

    # avg_buy_price stays unchanged on partial sell

    # 9) Increase account balance
    account.balance += total_proceeds

    # 10) Save transaction
    db.add(new_transaction)

    # 11) Commit transaction
    try:
        db.commit()
        db.refresh(account)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to record transaction: {str(exc)}"
        )

    # 12) Return response
    return SellResponse(
        message="Stock sold successfully",
        symbol=stock.symbol,
        quantity=request.quantity,
        unit_price=stock.price,
        total_proceeds=total_proceeds,
        remaining_balance=account.balance,
        shares_remaining=shares_remaining,
    )
