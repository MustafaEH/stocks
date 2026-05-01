# Trading API - FastAPI Backend

A production-ready FastAPI backend for a stock trading application.

## 🚀 Quick Start

### Local Development

1. **Create virtual environment:**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Linux/Mac
   # or
   .venv\Scripts\activate  # Windows
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```

5. **Access API:**
   - API: http://localhost:8000
   - Swagger Docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost/stocksDB` |
| `SECRET_KEY` | JWT secret key (generate with `python -c "import secrets; print(secrets.token_hex(32))"`) | - |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `30` |
| `CORS_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:5173,http://localhost:8080` |

### Generating a Secure Secret Key

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 🗄️ Database Setup

### Local PostgreSQL

1. Install PostgreSQL
2. Create database:
   ```sql
   CREATE DATABASE stocksDB;
   ```
3. Update `DATABASE_URL` in `.env`

### Render PostgreSQL

1. Create a PostgreSQL service on Render
2. Copy the internal connection string
3. Update `DATABASE_URL` in your Render environment variables

---

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login (returns JWT)
- `GET /auth/profile` - Get current user profile

### Stocks
- `GET /stocks/` - List all stocks
- `GET /stocks/{symbol}` - Get stock details
- `POST /stocks/add` - Add new stock (admin)

### Portfolio
- `GET /portfolio/` - Get user portfolio
- `POST /trade/buy` - Buy stock
- `POST /trade/sell` - Sell stock

### Account
- `GET /account/balance` - Get account balance
- `POST /account/deposit` - Deposit funds

### Transactions
- `GET /transactions/` - Get user transactions

### Health
- `GET /health` - Health check (DB + service)
- `GET /health/db` - Database-only health check

---

## ☁️ Deployment to Render

### Prerequisites

- GitHub repository
- Render account

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `trading-api` |
| Root Directory | `backend/trading-main/trading/backend` |
| Build Command | `pip install -r ../requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

### Step 3: Environment Variables

Add these environment variables in Render:

```
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=<generate-with-python>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=https://yourfrontend.vercel.app,http://localhost:8080
```

### Step 4: Health Check

Render will use `GET /health` to verify the service is running.

---

## 📋 Render Deployment Commands

### Build Command
```bash
pip install -r ../requirements.txt
```

### Start Command
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Environment Variables to Add

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your PostgreSQL connection string from Render |
| `SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |
| `CORS_ORIGINS` | `https://yourfrontend.vercel.app,http://localhost:8080` |

---

## 🔧 Database Migrations

If using Alembic:

```bash
# Create migration
alembic revision --autogenerate -m "Initial migration"

# Run migrations
alembic upgrade head
```

---

## 📖 API Documentation

Once running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🐛 Troubleshooting

### Database Connection Failed

1. Check `DATABASE_URL` is correct
2. Verify PostgreSQL is running
3. For production, ensure `sslmode=require` is in the connection string

### CORS Errors

Add your frontend URL to `CORS_ORIGINS` in `.env`:
```
CORS_ORIGINS=http://localhost:8080,https://yourfrontend.vercel.app
```

### JWT Errors

Ensure `SECRET_KEY` is set and consistent across restarts.

---

## 📁 Project Structure

```
backend/trading-main/
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (local)
├── .gitignore            # Git ignore rules
├── trading/
│   └── backend/
│       └── app/
│           ├── __init__.py      # App factory + lifespan
│           ├── config.py        # Settings management
│           ├── db.py            # Database engine
│           ├── security.py      # JWT functions
│           ├── models.py        # SQLAlchemy models
│           ├── schemas.py       # Pydantic schemas
│           ├── dependencies.py # Auth dependency
│           └── routes/         # API routes
│       └── main.py             # Entry point
└── README.md             # This file
```

---

## ✅ Health Check Response

```json
{
  "status": "ok",
  "database": "connected"
}
```

---

*Generated for Render deployment*