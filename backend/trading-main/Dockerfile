# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install all system dependencies upfront
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt 2>&1

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["uvicorn", "trading.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
