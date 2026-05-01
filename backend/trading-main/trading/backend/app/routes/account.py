from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_current_user

from app.db import get_db
from app.models import Account, User
from app.schemas import BalanceResponse, DepositRequest, DepositResponse

router = APIRouter(prefix="/account", tags=["account"])

# Maximum deposit amount to prevent abuse
MAX_DEPOSIT_AMOUNT = 1000000
MIN_DEPOSIT_AMOUNT = 0.01


@router.get("/balance", response_model=BalanceResponse)
def get_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    account = db.query(Account).filter(Account.user_id == current_user.id).first()
    if not account:
        account = Account(user_id=current_user.id, balance=0)
        db.add(account)
        db.commit()
        db.refresh(account)
    return BalanceResponse(balance=account.balance)


@router.post("/deposit", response_model=DepositResponse)
def deposit(
    request: DepositRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if request.amount < MIN_DEPOSIT_AMOUNT:
        raise HTTPException(status_code=400, detail=f"Deposit amount must be at least {MIN_DEPOSIT_AMOUNT}")
    if request.amount > MAX_DEPOSIT_AMOUNT:
        raise HTTPException(status_code=400, detail=f"Deposit amount cannot exceed {MAX_DEPOSIT_AMOUNT}")
    account = db.query(Account).filter(Account.user_id == current_user.id).first()
    if not account:
        account = Account(user_id=current_user.id, balance=0)
        db.add(account)
        db.flush()
    old_balance = account.balance
    account.balance += request.amount
    account.balance = round(account.balance, 2)
    try:
        db.commit()
        db.refresh(account)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process deposit")
    return DepositResponse(message="Deposit successful", balance=account.balance, old_balance=old_balance, deposited_amount=request.amount)