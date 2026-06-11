from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, String, text

from .db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    balance = Column(Numeric(15, 2), nullable=False, default=0)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    price = Column(Numeric(15, 2), nullable=False)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    transaction_type = Column(String, nullable=False)  # "buy" or "sell"
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(15, 2), nullable=False)
    total_price = Column(Numeric(15, 2), nullable=False)
    done_at = Column(TIMESTAMP(timezone=False), nullable=False, server_default=text("now()"))
    symbol = Column(String, nullable=False)


class Portfolio(Base):
    __tablename__ = "portfolio"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    stock_symbol = Column(String, primary_key=True)
    quantity = Column(Integer, nullable=False)
    avg_buy_price = Column(Numeric(15, 2), nullable=False)