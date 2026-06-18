from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class UserCreate(BaseModel):
    full_name: str
    email: str
    username: str
    password: str


class UserResponse(BaseModel):
    model_config = {"from_attributes": True}
    
    id: int
    full_name: str
    email: str
    username: str
    created_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class DepositResponse(BaseModel):
    message: str
    balance: Decimal
    old_balance: Optional[Decimal] = None
    deposited_amount: Optional[Decimal] = None


class DepositRequest(BaseModel):
    amount: Decimal

class BalanceResponse(BaseModel):
    balance: Decimal


class StockResponse(BaseModel):
    symbol: str
    name: str
    price: Decimal


class BuyResponse(BaseModel):
    message: str
    symbol: str
    quantity: int
    unit_price: Decimal
    total_cost: Decimal
    remaining_balance: Decimal

class TradeRequest(BaseModel):
    symbol: str
    quantity: int


class Transaction(BaseModel):
    message: str
    symbol: str
    quantity: int
    unit_price: Decimal
    total_cost: Decimal
    transaction_type: str


class PortfolioItem(BaseModel):
    symbol: str
    quantity: int
    avg_buy_price: Decimal
    current_price: Decimal
    market_value: Decimal
    profit_loss: Decimal



class SellResponse(BaseModel):
    message: str
    symbol: str
    quantity: int
    unit_price: Decimal
    total_proceeds: Decimal
    remaining_balance: Decimal
    shares_remaining: int