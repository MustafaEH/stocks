from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Stock
from app.schemas import StockResponse

router = APIRouter(prefix="/stocks", tags=["stocks"])


@router.get("/", response_model=list[StockResponse])
def get_stocks(db: Session = Depends(get_db)):
    stocks = db.query(Stock).all()
    return [StockResponse(symbol=stock.symbol, name=stock.name, price=stock.price) for stock in stocks]

@router.get("/{symbol}", response_model=StockResponse)
def get_stock(symbol: str, db: Session = Depends(get_db)):
    stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")
    return StockResponse(symbol=stock.symbol, name=stock.name, price=stock.price)


@router.post("/add", response_model=StockResponse)
def add_stock(stock: StockResponse, db: Session = Depends(get_db)):
    existing_stock = db.query(Stock).filter(Stock.symbol == stock.symbol.upper()).first()
    if existing_stock:
        raise HTTPException(status_code=400, detail="Stock with this symbol already exists")

    new_stock = Stock(symbol=stock.symbol.upper(), name=stock.name, price=stock.price)
    db.add(new_stock)
    db.commit()
    db.refresh(new_stock)
    return StockResponse(symbol=new_stock.symbol, name=new_stock.name, price=new_stock.price)