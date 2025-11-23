# Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for migrations)
RUN npm install

# Copy source code
COPY src ./src
COPY drizzle.config.ts ./
COPY drizzle ./drizzle

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for tsx to run migrations)
RUN npm install

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/drizzle.config.ts ./

# Copy startup script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Expose port
EXPOSE 3010

CMD ["/app/start.sh"]

