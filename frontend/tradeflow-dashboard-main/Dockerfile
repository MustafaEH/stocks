# Frontend Dockerfile - Multi-stage build
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* bun.lockb* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the built app
RUN npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Simple health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/index.html || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
