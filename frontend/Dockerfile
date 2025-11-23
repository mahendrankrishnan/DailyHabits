# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Note: Vite will automatically read environment variables from .env file during build
# Build args are optional - if not provided, .env file will be used

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm install

# Copy source code
COPY index.html ./
COPY src ./src
COPY public ./public

# Copy .env file (for Vite to read during build)
# Vite automatically loads .env files from the project root
COPY .env* ./

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

