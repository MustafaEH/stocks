from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.dependencies import get_current_user
from app.models import User, Transaction as TransactionModel
from app.schemas import Transaction as TransactionSchema

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get('/', response_model=list[TransactionSchema])
def get_transactions(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Get all transactions for the current user."""
    transactions = db.query(TransactionModel).filter(
        TransactionModel.user_id == current_user.id
    ).all()
    
    # Convert SQLAlchemy models to Pydantic schemas
    return [
        TransactionSchema(
            message=f"{t.transaction_type} {t.quantity} shares of {t.symbol}",
            symbol=t.symbol,
            quantity=t.quantity,
            unit_price=t.unit_price,
            total_cost=t.total_price,
            transaction_type=t.transaction_type
        )
        for t in transactions
    ]

@router.get('/all', response_model=list[TransactionSchema])
def get_all_transactions(db: Session = Depends(get_db)):
    """Get all transactions for all users (admin use)."""
    transactions = db.query(TransactionModel).all()
    
    return [
        TransactionSchema(
            message=f"{t.transaction_type} {t.quantity} shares of {t.symbol}",
            symbol=t.symbol,
            quantity=t.quantity,
            unit_price=t.unit_price,
            total_cost=t.total_price,
            transaction_type=t.transaction_type
        )
        for t in transactions
    ]