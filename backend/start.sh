#!/bin/sh

echo "Waiting for database to be ready..."
sleep 5

echo "Running migrations..."
npm run db:migrate || echo "Migrations failed or already run"

echo "Seeding predefined habits..."
npm run db:seed || echo "Seeding failed or already done"

echo "Starting backend server..."
node dist/index.js

