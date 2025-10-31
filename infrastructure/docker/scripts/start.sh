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
  echo "Starting development environment..."
  $COMPOSE_CMD -f infrastructure/docker/docker-compose.dev.yml up -d
  echo "Development environment started!"
  echo "Web: http://localhost:3000"
  echo "API: http://localhost:3001"
  echo "PostgreSQL: localhost:5432"
  echo "MongoDB: localhost:27017"
  echo "Redis: localhost:6379"
  echo "Elasticsearch: http://localhost:9200"
else
  echo "Starting production environment..."
  $COMPOSE_CMD -f infrastructure/docker/docker-compose.yml up -d
  echo "Production environment started!"
  echo "Web: http://localhost:3000"
  echo "API: http://localhost:3001"
fi

echo ""
echo "To view logs, run:"
if [ "$MODE" = "dev" ]; then
  echo "  $COMPOSE_CMD -f infrastructure/docker/docker-compose.dev.yml logs -f"
else
  echo "  $COMPOSE_CMD -f infrastructure/docker/docker-compose.yml logs -f"
fi
