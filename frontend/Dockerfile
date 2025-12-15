# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for Vite environment variables
# These can be passed from docker-compose.yml or will be empty if not provided
ARG VITE_LOGIN_USERNAME
ARG VITE_LOGIN_PASSWORD
ARG VITE_LOGIN_PHONE

# Debug: Print build args (will show in build logs)
RUN echo "Build args received:" && \
    echo "VITE_LOGIN_USERNAME=${VITE_LOGIN_USERNAME:-NOT_SET}" && \
    echo "VITE_LOGIN_PASSWORD=${VITE_LOGIN_PASSWORD:+SET}" && \
    echo "VITE_LOGIN_PHONE=${VITE_LOGIN_PHONE:-NOT_SET}"

# Set as environment variables for Vite to read during build
# Vite reads environment variables prefixed with VITE_ at build time
ENV VITE_LOGIN_USERNAME=${VITE_LOGIN_USERNAME}
ENV VITE_LOGIN_PASSWORD=${VITE_LOGIN_PASSWORD}
ENV VITE_LOGIN_PHONE=${VITE_LOGIN_PHONE}

# Copy package files
COPY frontend/package*.json ./
COPY frontend/tsconfig.json ./
COPY frontend/tsconfig.node.json ./
COPY frontend/vite.config.ts ./

# Install dependencies
RUN npm install

# Copy source code
COPY frontend/index.html ./
COPY frontend/src ./src
COPY frontend/public ./public

# Note: Environment variables are set via build args (from docker-compose.yml)
# docker-compose.yml automatically reads .env from project root and passes
# VITE_LOGIN_* variables as build args, which are then set as ENV above
# If build args are empty, Vite will try to read from .env file if it exists

# Build the application
# Vite will use the environment variables set above or from .env file
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

