#!/usr/bin/env bash
# ============================================
# PlanIT.IO — Dev Startup Script
# ============================================
set -euo pipefail

echo "🚀 PlanIT.IO — Starting development environment..."
echo ""

# Ensure Docker services are running
echo "🐳 Ensuring Docker services are up..."
docker compose -f docker/docker-compose.yml up -d

echo ""
echo "🔧 Starting all services via Turborepo..."
pnpm dev
