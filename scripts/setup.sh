#!/usr/bin/env bash
# ============================================
# PlanIT.IO — First-Time Setup Script
# ============================================
set -euo pipefail

echo "🚀 PlanIT.IO — Setting up development environment..."
echo ""

# Check prerequisites
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo "❌ $1 is not installed. Please install it first."
    echo "   $2"
    exit 1
  else
    echo "✅ $1 found: $(command -v "$1")"
  fi
}

echo "📋 Checking prerequisites..."
check_command "node" "Install via https://nodejs.org/ or nvm"
check_command "pnpm" "Install via: npm install -g pnpm"
check_command "rustc" "Install via: https://rustup.rs/"
check_command "cargo" "Install via: https://rustup.rs/"
check_command "docker" "Install via: https://docs.docker.com/get-docker/"

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
else
  echo "ℹ️  .env already exists, skipping"
fi

echo ""
echo "🐳 Starting Docker services..."
docker compose -f docker/docker-compose.yml up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

echo ""
echo "✅ Setup complete! Run 'pnpm dev' to start development."
