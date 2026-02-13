<div align="center">

# 🚀 PlanIT.IO

### Project Management & Planning — Redefined

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/your-org/planit-io/ci.yml?label=CI)](https://github.com/your-org/planit-io/actions)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri&logoColor=white)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)

A **high-performance, secure, cross-platform** desktop application for project management and team planning. Built with Tauri v2, React, and NestJS microservices.

*Inspired by Microsoft Planner & Motadata ServiceOps*

</div>

---

## ✨ Features

- 📋 **Kanban Boards** — Visual task management with drag-and-drop
- 🏗️ **Workspaces & Projects** — Organize work hierarchically
- ✅ **Rich Tasks** — Subtasks, checklists, labels, priorities, due dates, attachments
- 📊 **Dashboards & Analytics** — Charts for task status, workload, and progress
- 👥 **Team Collaboration** — Comments, @mentions, activity logs
- 🔔 **Notifications** — In-app and system tray alerts
- 🔍 **Powerful Search** — Find anything across projects, tasks, and comments
- 🌙 **Dark & Light Theme** — Your preference, your way
- 📡 **Offline-First** — Work without internet, sync when connected
- 🔒 **Secure by Design** — Encrypted data, RBAC, capability-based permissions
- 🖥️ **Cross-Platform** — Windows, macOS, and Linux

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Desktop App (Tauri v2)              │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  React Frontend  │  │  Rust Core (Tauri)   │  │
│  │  TypeScript + UI │◄►│  IPC · SQLite · Tray │  │
│  └──────────────────┘  └──────────┬───────────┘  │
└───────────────────────────────────┼──────────────┘
                                    │ HTTP / WebSocket
                    ┌───────────────▼───────────────┐
                    │       API Gateway (NestJS)     │
                    └───┬───┬───┬───┬───┬───────────┘
                        │   │   │   │   │
          ┌─────────────┼───┼───┼───┼───┼─────────────┐
          │  Auth  │ Users │ Projects │ Tasks │ Notifs  │
          │  Svc   │  Svc  │   Svc    │  Svc  │  Svc   │
          └────────┴───────┴──────────┴───────┴────────┘
                        │                 │
              ┌─────────▼──┐    ┌────────▼────┐
              │ PostgreSQL  │    │    NATS     │
              │   (Data)    │    │  (Messaging)│
              └─────────────┘    └─────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Desktop Shell | [Tauri v2](https://tauri.app/) (Rust) |
| Frontend | [React 19](https://react.dev/) + TypeScript + Vite |
| Backend | [NestJS 11](https://nestjs.com/) + TypeScript |
| Database | PostgreSQL 17 + SQLite (offline) |
| Messaging | NATS |
| Monorepo | pnpm workspaces + Turborepo |
| CI/CD | GitHub Actions |

## 📁 Project Structure

```
planit-io/
├── apps/desktop/          # Tauri v2 desktop application
├── services/              # Backend microservices
│   ├── gateway/           # API Gateway
│   ├── auth/              # Authentication service
│   ├── users/             # User management service
│   ├── projects/          # Project & workspace service
│   ├── tasks/             # Task & board service
│   └── notifications/     # Notification service
├── packages/              # Shared packages
│   ├── shared-types/      # TypeScript types & interfaces
│   ├── shared-utils/      # Common utilities
│   ├── ui-components/     # Shared React components
│   └── validation/        # Shared Zod validation schemas
├── prisma/                # Database schema & migrations
├── docker/                # Docker & Docker Compose configs
└── docs/                  # Documentation & ADRs
```

## 🚀 Getting Started

### Prerequisites

- [Node.js 22 LTS](https://nodejs.org/) (via [nvm](https://github.com/nvm-sh/nvm))
- [Rust](https://rustup.rs/) (for Tauri)
- [pnpm 9+](https://pnpm.io/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/planit-io.git
cd planit-io

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start infrastructure (PostgreSQL, NATS)
docker compose up -d

# Run database migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

### Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start all services in development mode |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run all tests |
| `pnpm db:migrate` | Run Prisma database migrations |
| `pnpm db:studio` | Open Prisma Studio GUI |

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a Pull Request.

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## 🔒 Security

For security concerns, please refer to our [Security Policy](SECURITY.md).

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by the PlanIT.IO Team</sub>
</div>