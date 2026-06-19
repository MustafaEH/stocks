# 📈 Stocks Tradeflow — Real-Time Trading Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/DevOps-Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

Stocks Tradeflow is a robust, full-stack trading simulation application designed with clean architecture principles. It couples a high-performance **FastAPI backend** running a real-time market simulator with a modern **React + Vite + Tailwind CSS frontend dashboard** that visualizes stock prices, portfolio value, and historical transactions.

---

## 🏗️ System Architecture & Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Trader (Frontend)
    participant API as FastAPI Backend
    participant DB as PostgreSQL Database
    participant Sim as Market Simulator (BG Task)

    Note over Sim, DB: Price Simulation Loop (Runs every 15s)
    loop Every 15 Seconds
        Sim->>DB: Fetch current stock prices
        Sim->>Sim: Calculate random price drift (±1.5%)
        Sim->>DB: Commit updated stock prices
    end

    Note over User, DB: Stock Purchase Flow
    User->>API: POST /trade/buy {symbol, quantity} (JWT Auth)
    activate API
    API->>DB: Start transaction block & locks (with_for_update)
    DB-->>API: Row locks acquired for Stock & User Account
    API->>API: Validate balance >= quantity * stock_price
    API->>DB: Deduct cash balance from Account
    API->>DB: Upsert Portfolio (recalculate average buy price)
    API->>DB: Insert transaction record (BUY)
    API->>DB: Commit Transaction & Release Locks
    DB-->>API: Confirm success
    API-->>User: Return updated balance & confirmation
    deactivate API

    Note over User, DB: Portfolio Valuation Flow
    User->>API: GET /portfolio/ (Fetch dashboard metrics)
    activate API
    API->>DB: Query Portfolio JOIN Stocks
    DB-->>API: Raw holdings + current prices
    API->>API: Compute P&L & market value dynamically
    API-->>User: Return list with live market valuations
    deactivate API
```

---

## 🎛️ Backend Core Flow & Mechanics

The backend architecture is structured around clean dependency injection, transaction safety, and concurrent async tasks:

### 1. Lifespan Events & Market Simulator
When the FastAPI application initializes:
- It runs database pre-ping connectivity verification.
- It spawns a concurrent background worker task (`_market_simulator_task`) using `asyncio.create_task()`.
- Every 15 seconds, the task wakes up, queries all stocks, applies a random drift (`random.uniform(-0.015, 0.015)`), updates the database records, and commits.
- Upon application shutdown, the worker is safely cancelled, and connection pools are clean-disposed.

### 2. Transaction Integrity & Concurrent Safety
To avoid race conditions (e.g., spending balance twice, selling more shares than owned), the trading system employs database row-level locking:
- Uses SQLAlchemy's nested transaction context (`with db.begin_nested()`).
- Employs pessimistic locking (`.with_for_update()`) on stock prices and account balances.
- In case of failure (insufficient funds, stock not found), it executes an immediate rollback.

### 3. Dynamic Portfolio Calculations
Instead of storing redundant static values, portfolio metrics are calculated dynamically:
- Holding data and current stock prices are joined on-demand:
  $$\text{Market Value} = \text{Quantity} \times \text{Current Price}$$
  $$\text{Profit / Loss} = (\text{Current Price} - \text{Average Buy Price}) \times \text{Quantity}$$
- This guarantees that price fluctuations from the background simulator are instantly reflected in the user's net worth.

---

## 🗄️ Database Design

The relational database structure ensures strict constraints, cascaded deletion on profile removal, and indexing for quick retrieval:

```mermaid
erDiagram
    USERS ||--|| ACCOUNTS : "has wallet"
    USERS ||--o{ PORTFOLIO : "owns"
    USERS ||--o{ TRANSACTIONS : "executes"
    STOCKS ||--o{ PORTFOLIO : "referenced in"

    USERS {
        int id PK
        string full_name
        string email UK
        string username UK
        string password_hash
        timestamp created_at
    }

    ACCOUNTS {
        int id PK
        int user_id FK,UK
        numeric balance "DEFAULT 0"
        timestamp created_at
    }

    STOCKS {
        int id PK
        string name
        string symbol UK
        numeric price
    }

    PORTFOLIO {
        int user_id PK, FK
        string stock_symbol PK, FK
        int quantity "CHECK quantity > 0"
        numeric avg_buy_price "CHECK price > 0"
    }

    TRANSACTIONS {
        int id PK
        int user_id FK
        string stock_symbol
        string transaction_type "'BUY' or 'SELL'"
        int quantity "CHECK > 0"
        numeric price "CHECK > 0"
        numeric total_amount
        timestamp created_at
    }
```

---

## 📡 Key API Endpoints

The API is fully documented out-of-the-box with Swagger and ReDoc:

* **Authentication (`/auth`)**
  * `POST /auth/register` — Registers new trader & provisions a linked account.
  * `POST /auth/login` — Verifies passwords, generates secure JWT bearer token.
  * `GET /auth/profile` — Retrieves profile details (requires authentication).
* **Stocks (`/stocks`)**
  * `GET /stocks/` — Lists all registered stocks with real-time prices.
  * `GET /stocks/{symbol}` — Retrieves details of a specific ticker.
  * `POST /stocks/add` — Administrative route to seed/register new stock tickers.
* **Account (`/account`)**
  * `GET /account/balance` — Fetches current wallet cash balance.
  * `POST /account/deposit` — Deposits funds into wallet (limits: `$0.01` to `$1,000,000`).
* **Trading & Portfolio (`/trade`, `/portfolio`, `/transactions`)**
  * `POST /trade/buy` — Places stock purchase orders (safe transaction handling).
  * `POST /trade/sell` — Sells holdings back to the market.
  * `GET /portfolio/` — Returns real-time holdings, current value, and profit/loss.
  * `GET /transactions/` — Lists history of completed trades for the logged-in user.

---

## ⚙️ Environment Configuration

Both backend and database are configured via environment parameters. In development, the defaults match the Docker Compose setup:

| Variable | Description | Development Default |
|----------|-------------|---------------------|
| `DATABASE_URL` | PostgreSQL DB Connection String | `postgresql://postgres:mustafa@postgres:5432/stocksDB` |
| `SECRET_KEY` | JWT signing secret key | `your-secret-key-change-in-production` |
| `ALGORITHM` | JWT Signature Algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiration lifespan of JWT tokens | `30` |
| `CORS_ORIGINS` | Allowed cross-origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `VITE_API_URL` | (Frontend) Target address of backend | `http://localhost:8000` |

---

## 🚀 Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) (recommended)
- Python 3.11+ & Node.js 18+ (if running manually without containers)

### Setup Options

#### Option A: Docker Compose (Recommended - Quick Start)
Spin up the entire stack with one command. This will initialize the PostgreSQL database, run the schema migrations, insert seed stocks, and start both applications:

```bash
# Clone the repository and boot the services
docker-compose up --build
```
* **Frontend Dashboard:** http://localhost:3000
* **Backend API & docs:** http://localhost:8000/docs
* **PostgreSQL Server:** localhost:5432 (credentials: `postgres` / `mustafa`)

Alternatively, you can run the helpers in the root:
* **Windows:** Double-click or run `start.cmd`
* **Linux/Mac:** Run `./start.sh`

#### Option B: Manual Setup (Local Dev)

**1. Database & Schema Initialization:**
Set up a PostgreSQL server database called `stocksDB`, then execute the setup scripts in order:
```bash
psql -U postgres -d stocksDB -f backend/trading-main/00-schema.sql
psql -U postgres -d stocksDB -f backend/trading-main/01-data.sql
```

**2. Run Backend API:**
```bash
cd backend/trading-main
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
# Copy sample configuration
cp .env.example .env  # Edit as required
uvicorn trading.backend.main:app --reload --port 8000
```

**3. Run Frontend Dashboard:**
```bash
cd frontend/tradeflow-dashboard-main
npm install
npm run dev -- --port 3000
```

---

## 🧪 Verification & Troubleshooting

* **Verify Backend & DB Connectivity:**
  Send a GET request to http://localhost:8000/health. You should receive:
  ```json
  {
    "status": "ok",
    "database": "connected"
  }
  ```
* **Clean Reset database volume:**
  If you need to wipe out the database and re-initialize the schemas from scratch:
  ```bash
  docker-compose down -v
  docker-compose up
  ```

---

## 📄 License
This project is licensed under the MIT License.

---

## 📞 Contact

If you'd like a walkthrough or a short demo recording for hiring purposes, open an issue or reach out.
