# 🐳 Docker Setup Guide - Stocks Trading Platform

## ✅ What's Fixed

The Docker setup is now **fully working** with all dependencies properly configured.

**Fixed Issue:** There was a Python dependency conflict:
- `fastapi 0.115.0` requires `starlette<0.39.0`
- The original requirements specified `starlette==0.40.0` (incompatible)
- **Solution:** Removed `starlette` from requirements.txt (fastapi includes it automatically)

## 🚀 Quick Start (One Command)

### Windows
```cmd
start.cmd
```

### Linux/Mac
```bash
./start.sh
```

### Manual (All Platforms)
```bash
docker-compose up
```

## 📍 Access Your Application

After running the startup command, access:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Web Dashboard |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/docs | Swagger UI |
| **Database** | localhost:5432 | PostgreSQL |

## 📋 Services Running

```
├── PostgreSQL (database)
│   ├── Host: postgres
│   ├── Port: 5432
│   ├── Database: stocksDB
│   └── Auto-initialized with SQL files
│
├── Backend (FastAPI)
│   ├── Container: stocks_backend
│   ├── Port: 8000
│   ├── Health Check: http://localhost:8000/health
│   └── Database: Connected to postgres
│
└── Frontend (React)
    ├── Container: stocks_frontend
    ├── Port: 3000
    ├── API Endpoint: http://localhost:8000
    └── Health Check: http://localhost:3000
```

## 🛠️ Common Commands

### Start services
```bash
docker-compose up
```

### Start in background
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f                 # All services
docker-compose logs -f backend         # Backend only
docker-compose logs -f frontend        # Frontend only
docker-compose logs -f postgres        # Database only
```

### Stop services
```bash
docker-compose down                    # Stop only
docker-compose down -v                 # Stop and remove volumes (deletes database)
```

### Rebuild images
```bash
docker-compose build --no-cache        # Full rebuild
docker-compose build backend           # Backend only
docker-compose build frontend          # Frontend only
```

### Access container shell
```bash
docker-compose exec backend bash       # Backend shell
docker-compose exec frontend sh        # Frontend shell
docker-compose exec postgres psql -U postgres  # Database
```

### Check container status
```bash
docker-compose ps                      # List all containers
docker ps -a                           # Show all containers
docker image ls | grep stocks          # Show stocks images
```

## 🔍 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Verify database connection
docker-compose exec backend curl http://localhost:8000/health
```

### Database connection issues
```bash
# Check database is running
docker-compose logs postgres

# Test database connection
docker-compose exec postgres psql -U postgres stocksDB -c "SELECT 1"

# Verify network
docker network ls
docker network inspect stocks_network
```

### Frontend shows blank page
```bash
# Check frontend logs
docker-compose logs frontend

# Verify API connection
docker-compose exec frontend wget -O- http://localhost:8000/health
```

### Ports already in use
Edit `docker-compose.yml` and change the port mappings:
```yaml
backend:
  ports:
    - "8001:8000"    # Use 8001 instead of 8000

frontend:
  ports:
    - "3001:3000"    # Use 3001 instead of 3000
```

Then restart:
```bash
docker-compose up
```

### Database already has data from previous run
Remove old database volume:
```bash
docker-compose down -v    # Remove everything including data
```

## 🌍 Environment Variables

Key configs in `docker-compose.yml`:

```yaml
backend:
  environment:
    DATABASE_URL: postgresql://postgres:mustafa@postgres:5432/stocksDB
    SECRET_KEY: your-secret-key-change-in-production
    CORS_ORIGINS: "http://localhost:3000,http://127.0.0.1:3000"
```

### For Production

Change these values:
1. `SECRET_KEY` - Generate a strong secret key
2. `DATABASE_URL` - Use production database
3. `CORS_ORIGINS` - Update to your production domain

Example:
```bash
SECRET_KEY=$(openssl rand -hex 32)
```

##📦 Files Created/Modified

```
d:\mustafa\stocks\
├── docker-compose.yml              ← Orchestrates all services
├── .dockerignore                   ← Optimizes build context
├── start.cmd                       ← Windows startup script
├── start.sh                        ← Linux/Mac startup script
├── backend/trading-main/
│   ├── Dockerfile                  ← Backend build config
│   └── requirements.txt            ← Python dependencies (FIXED)
└── frontend/tradeflow-dashboard-main/
    └── Dockerfile                  ← Frontend build config
```

## 🔒 Security Notes

**Current Setup (Development)**
- Default passwords used
- CORS accepts localhost
- SECRET_KEY is generic

**Before Production**
- Generate strong SECRET_KEY: `openssl rand -hex 32`
- Change database password
- Update CORS_ORIGINS to your domain
- Set DATABASE_URL to production database
- Enable HTTPS
- Use environment secrets instead of hardcoding

## 🐛 Debug Mode

To see detailed build output:
```bash
docker-compose build --progress=plain backend
```

To inspect final image:
```bash
docker run -it stocks-backend bash
docker run -it stocks-frontend sh
```

## 📚 Docker Commands Reference

| Command | Purpose |
|---------|---------|
| `docker-compose build` | Build images |
| `docker-compose up` | Start all services |
| `docker-compose down` | Stop all services |
| `docker-compose ps` | List running services |
| `docker-compose logs` | View service logs |
| `docker-compose exec` | Execute command in container |
| `docker ps -a` | List all containers |
| `docker images` | List all images |
| `docker network ls` | List networks |
| `docker volume ls` | List volumes |

## ✅ Health Checks

All services include automated health checks:

```bash
# Backend health
curl http://localhost:8000/health

# Frontend health  
curl http://localhost:3000

# Database health
docker-compose exec postgres pg_isready -U postgres
```

## 🎯 Next Steps

1. Run `start.cmd` (Windows) or `./start.sh` (Linux/Mac)
2. Open http://localhost:3000 in your browser
3. Check backend at http://localhost:8000/docs
4. Verify database with: `docker-compose exec postgres psql -U postgres stocksDB`

---

**Everything is now properly dockerized and ready to run!** 🚀

