# Docker Deployment Guide

This guide explains how to deploy the Daily Habits Tracker application using Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Set up environment variables** (optional):
   - Create a `.env` file in the root directory if you want to customize the OpenAI API key:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```

2. **Build and start all services**:
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3010
   - Backend API: http://localhost:3011
   - PostgreSQL: localhost:5434

## Services

### PostgreSQL Database
- **Port**: 5434 (host) → 5432 (container)
- **Database**: habits
- **User**: postgres
- **Password**: postgres
- **Data**: Persisted in Docker volume `postgres_data`

### Backend API
- **Port**: 3011 (host) → 3001 (container)
- **Environment**: Production
- **Auto-migrations**: Runs database migrations on startup
- **Auto-seeding**: Seeds predefined habits on startup

### Frontend
- **Port**: 3010 (host) → 80 (container)
- **Server**: Nginx
- **Proxy**: API requests are proxied to backend

## Docker Compose Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild services
```bash
docker-compose up -d --build
```

### Stop and remove volumes (⚠️ deletes database data)
```bash
docker-compose down -v
```

## Development vs Production

### Development
For development, you can still run services individually:
```bash
# Start only database
docker-compose up -d postgres

# Run backend locally
cd backend && npm run dev

# Run frontend locally
cd frontend && npm run dev
```

### Production
The Docker setup is optimized for production:
- Frontend is built and served via Nginx
- Backend runs in production mode
- Database migrations run automatically on startup

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL container is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`
- Wait a few seconds after starting for database to initialize

### Backend not starting
- Check if migrations are failing: `docker-compose logs backend`
- Verify database is accessible from backend container
- Check environment variables

### Frontend not loading
- Verify frontend container is running: `docker-compose ps`
- Check nginx logs: `docker-compose logs frontend`
- Ensure backend is accessible (frontend proxies API calls)

### Port conflicts
If ports 3010, 3011, or 5434 are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Change frontend port (host:container)
  - "3002:3001"  # Change backend port (host:container)
  - "5435:5432"  # Change database port (host:container)
```

## Environment Variables

You can customize the following via environment variables or `.env` file:

- `OPENAI_API_KEY`: OpenAI API key for AI features (optional)
- Database credentials (defaults in docker-compose.yml)

## Data Persistence

Database data is stored in a Docker volume `postgres_data`. To backup:
```bash
docker-compose exec postgres pg_dump -U postgres habits > backup.sql
```

To restore:
```bash
docker-compose exec -T postgres psql -U postgres habits < backup.sql
```

