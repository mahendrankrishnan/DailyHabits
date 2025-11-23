#!/bin/bash

# Helper script to manage PostgreSQL Docker container

case "$1" in
  start)
    echo "🚀 Starting PostgreSQL container..."
    docker-compose up -d
    echo "✅ PostgreSQL is running!"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   User: postgres"
    echo "   Password: postgres"
    echo "   Database: habits"
    ;;
  stop)
    echo "🛑 Stopping PostgreSQL container..."
    docker-compose down
    echo "✅ PostgreSQL stopped!"
    ;;
  restart)
    echo "🔄 Restarting PostgreSQL container..."
    docker-compose restart
    echo "✅ PostgreSQL restarted!"
    ;;
  status)
    docker-compose ps
    ;;
  logs)
    docker-compose logs -f postgres
    ;;
  shell)
    echo " Shell access to PostgreSQL container..."
    docker-compose exec postgres psql -U postgres -d habits
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs|shell}"
    echo ""
    echo "Commands:"
    echo "  start   - Start PostgreSQL container"
    echo "  stop    - Stop PostgreSQL container"
    echo "  restart - Restart PostgreSQL container"
    echo "  status  - Show container status"
    echo "  logs    - Show container logs"
    echo "  shell   - Open PostgreSQL shell"
    exit 1
    ;;
esac

