# Backend Dockerfile
# Use Debian slim (not Alpine) — esbuild postinstall is unreliable on Alpine in Docker.
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

# Single install in builder; production stage reuses node_modules (no parallel second install).
RUN npm install --no-audit --no-fund \
  || (sleep 3 && rm -rf node_modules && npm install --no-audit --no-fund)

COPY src ./src
COPY drizzle.config.ts ./

RUN npm run db:generate || echo "Migration generation completed or skipped"

RUN npm run build

FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/drizzle.config.ts ./

COPY start.sh ./start.sh
RUN chmod +x ./start.sh

EXPOSE 3010

CMD ["/app/start.sh"]
