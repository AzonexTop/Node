#!/bin/bash
set -e

cd "$(dirname "$0")/../../../"

# Detect docker-compose command
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

echo "Stopping and removing all containers, networks, and volumes..."

$COMPOSE_CMD -f infrastructure/docker/docker-compose.yml down -v
$COMPOSE_CMD -f infrastructure/docker/docker-compose.dev.yml down -v

echo "Cleaning up dangling images..."
docker image prune -f

echo "Cleanup completed successfully!"
echo ""
echo "Note: Database data has been removed. You'll start fresh on next run."
