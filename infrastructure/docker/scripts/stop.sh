#!/bin/bash
set -e

MODE="${1:-prod}"

cd "$(dirname "$0")/../../../"

# Detect docker-compose command
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

if [ "$MODE" = "dev" ]; then
  echo "Stopping development environment..."
  $COMPOSE_CMD -f infrastructure/docker/docker-compose.dev.yml down
else
  echo "Stopping production environment..."
  $COMPOSE_CMD -f infrastructure/docker/docker-compose.yml down
fi

echo "Environment stopped successfully!"
