@echo off
REM Simple startup script for the Stocks Trading Project

echo ====================================
echo   Stocks Trading Docker Start
echo ====================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo [1/3] Building Docker images...
docker-compose build

if errorlevel 1 (
    echo ERROR: Docker build failed
    pause
    exit /b 1
)

echo.
echo [2/3] Starting containers...
docker-compose up -d

if errorlevel 1 (
    echo ERROR: Failed to start containers
    pause
    exit /b 1
)

echo.
echo [3/3] Waiting for services to be ready...
timeout /t 5 /nobreak

echo.
echo ====================================
echo   ✓ Services are starting up
echo ====================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Database: localhost:5432
echo.
echo View logs with: docker-compose logs -f
echo Stop with: docker-compose down
echo.
pause
