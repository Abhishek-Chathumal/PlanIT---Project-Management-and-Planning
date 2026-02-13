---
description: Start the full development stack (Docker, services, and frontend)
---

# Start Development Environment

// turbo-all

## Prerequisites

- Docker Desktop running
- Node.js 22+, pnpm 9+ installed
- Rust toolchain installed (for Tauri desktop builds only)

## Step 1: Start infrastructure (PostgreSQL + NATS)

```bash
docker compose -f docker/docker-compose.yml up -d
```

Wait a few seconds for healthchecks to pass.

## Step 2: Run database migrations

```bash
pnpm db:migrate
```

## Step 3: (Optional) Seed the database

```bash
pnpm db:seed
```

## Step 4: Start all backend services + frontend

```bash
pnpm dev
```

This runs `turbo run dev` which starts:

- **Gateway** (HTTP) → http://localhost:3000
- **Auth** microservice → NATS
- **Users** microservice → NATS
- **Projects** microservice → NATS
- **Tasks** microservice → NATS
- **Notifications** microservice → NATS
- **Desktop frontend** (Vite) → http://localhost:5173

## Step 5: (Optional) Launch Tauri desktop window

Only if you want the native desktop app instead of browser:

```bash
cd apps/desktop && pnpm tauri:dev
```

## Stopping

```bash
# Stop services: Ctrl+C in the terminal running pnpm dev
# Stop infrastructure:
docker compose -f docker/docker-compose.yml down
```

## Useful Commands

| Command               | Description                             |
| --------------------- | --------------------------------------- |
| `pnpm db:studio`      | Open Prisma Studio (database GUI)       |
| `pnpm db:migrate:dev` | Create new migration during development |
| `pnpm lint`           | Run ESLint across all packages          |
| `pnpm test`           | Run tests across all packages           |
| `pnpm build`          | Build all packages for production       |
