# PowerShell helper script to manage PostgreSQL Docker container

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "shell")]
    [string]$Action
)

switch ($Action) {
    "start" {
        Write-Host "🚀 Starting PostgreSQL container..." -ForegroundColor Green
        docker-compose up -d
        Write-Host "✅ PostgreSQL is running!" -ForegroundColor Green
        Write-Host "   Host: localhost"
        Write-Host "   Port: 5432"
        Write-Host "   User: postgres"
        Write-Host "   Password: postgres"
        Write-Host "   Database: habits"
    }
    "stop" {
        Write-Host "🛑 Stopping PostgreSQL container..." -ForegroundColor Yellow
        docker-compose down
        Write-Host "✅ PostgreSQL stopped!" -ForegroundColor Green
    }
    "restart" {
        Write-Host "🔄 Restarting PostgreSQL container..." -ForegroundColor Cyan
        docker-compose restart
        Write-Host "✅ PostgreSQL restarted!" -ForegroundColor Green
    }
    "status" {
        docker-compose ps
    }
    "logs" {
        docker-compose logs -f postgres
    }
    "shell" {
        Write-Host " Shell access to PostgreSQL container..." -ForegroundColor Cyan
        docker-compose exec postgres psql -U postgres -d habits
    }
}

