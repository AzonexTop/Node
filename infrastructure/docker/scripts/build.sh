#!/bin/bash
set -e

echo "Building all containers..."

cd "$(dirname "$0")/../../../"

# Detect docker-compose command
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

# Build all services
$COMPOSE_CMD -f infrastructure/docker/docker-compose.yml build "$@"

echo "Build completed successfully!"
