from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models import Account, User, Stock, Transaction as TransactionModel
from app.schemas import TradeRequest, BuyResponse

router = APIRouter(prefix="/buy", tags=["buy"])

@router.post("/", response_model=BuyResponse)
def buy_stock(
    request: TradeRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user) # Get the person first
):
    # 1. Find the stock
    stock = db.query(Stock).filter(Stock.symbol == request.symbol.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    # 2. Find the user's account specifically
    account = db.query(Account).filter(Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if request.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

    # 3. Calculate and validate
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

    # 4. Perform the "Atomic" update
    account.balance -= total_cost
    db.add(new_transaction)
    try:
        db.commit()
        db.refresh(account) # Get the latest balance after the commit
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