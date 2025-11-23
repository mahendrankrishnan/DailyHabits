# This Daily Habits & Activities Tracker Application help you to build daily habits and activities , one at a time. Focus on what matters most. 

Modern daily habit tracking application built with React, TypeScript, Fastify, and PostgreSQL.

## Features

- ✨ Create, edit, and delete habits
- 📅 Track daily habit completion
- 🎨 Customizable colors for each habit
- 💾 Persistent data storage with PostgreSQL
- 🚀 Fast and modern UI/UX

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Axios

### Backend
- Fastify
- TypeScript
- Drizzle ORM
- PostgreSQL

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for PostgreSQL)

## Setup

### 1. Install dependencies

From the root directory:
```bash
npm install
```

### 2. Start PostgreSQL with Docker

The easiest way to run PostgreSQL is using Docker Compose:

```bash
docker-compose up -d
```

This will:
- Pull the PostgreSQL 16 Alpine image from Docker Hub
- Create a container named `habit-tracker-db`
- Create the `habits` database automatically
- Expose PostgreSQL on port `5434` (to avoid conflicts with existing PostgreSQL instances)

**Note:** If you have PostgreSQL running on port 5432, the Docker container uses port 5434 instead. You can change the port in `docker-compose.yml` if needed, or connect to your existing PostgreSQL instance by updating the `.env` file.

To stop the database:
```bash
docker-compose down
```

To stop and remove all data:
```bash
docker-compose down -v
```

**You can also use to Alternative: Using npm scripts**
```bash
npm run db:up      # Start the PostgreSQL
npm run db:down    # Stop the PostgreSQL
npm run db:logs    # View the logs
npm run db:shell   # Open PostgreSQL shell
```

### 3. Configure Database Connection

1. Copy the backend environment file:
```bash
cp backend/env.example backend/.env
```

2. The default `.env` file is already configured to work with the Docker PostgreSQL instance:
```
PORT=3010
DB_HOST=localhost
DB_PORT=5434
DB_USER=Testpostgres
DB_PASSWORD=Passwordpostgres
DB_NAME=Testhabits
```

**Using your existing PostgreSQL instance instead?**
If you want to use your existing PostgreSQL on port 5432, update `backend/.env` with:
- `DB_PORT=5432` (or whatever port your instance uses)
- `DB_USER`, `DB_PASSWORD`, and `DB_NAME` as appropriate
- Make sure the `habits` database exists: `CREATE DATABASE habits;`

### 4. Run Database Migrations to create tables and seeds to populate the static data

```bash
cd backend
npm run db:generate
npm run db:migrate
```

### 5. Start Development Servers

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3011
- Frontend server on http://localhost:3010

## Project Structure

```
habit-tracker/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts       # Database schema
│   │   │   ├── index.ts        # Database connection
│   │   │   └── migrate.ts      # Migration script
│   │   ├── routes/
│   │   │   └── habits.ts       # API routes
│   │   └── index.ts            # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/           # API service
│   │   ├── types.ts            # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── package.json
```

## API Endpoints

- `GET /habits` - Get all habits
- `GET /habits/:id` - Get a specific habit
- `POST /habits` - Create a new habit
- `PUT /habits/:id` - Update a habit
- `DELETE /habits/:id` - Delete a habit
- `GET /habits/:id/logs` - Get logs for a habit
- `POST /habits/:id/logs` - Log habit completion

## License

MIT

