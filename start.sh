#!/bin/bash

# Simple startup script for the Stocks Trading Project

echo "===================================="
echo "  Stocks Trading Docker Start"
echo "===================================="
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "ERROR: Docker is not running. Please start Docker."
    exit 1
fi

echo "[1/3] Building Docker images..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "ERROR: Docker build failed"
    exit 1
fi

echo ""
echo "[2/3] Starting containers..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to start containers"
    exit 1
fi

echo ""
echo "[3/3] Waiting for services to be ready..."
sleep 5

echo ""
echo "===================================="
echo "  ✓ Services are starting up"
echo "===================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "Database: localhost:5432"
echo ""
echo "View logs with: docker-compose logs -f"
echo "Stop with: docker-compose down"
echo ""
