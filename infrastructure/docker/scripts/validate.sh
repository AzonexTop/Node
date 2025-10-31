#!/bin/bash
set -e

echo "Validating Docker setup..."
echo ""

cd "$(dirname "$0")/../../../"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi
echo "✅ Docker is installed"

# Check if Docker Compose is installed (either standalone or plugin)
if command -v docker-compose &> /dev/null; then
    echo "✅ Docker Compose is installed (standalone)"
elif docker compose version &> /dev/null; then
    echo "✅ Docker Compose is installed (plugin)"
    # Create an alias for the validation
    shopt -s expand_aliases
    alias docker-compose='docker compose'
else
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Check if Dockerfiles exist
echo ""
echo "Checking Dockerfiles..."
if [ -f "infrastructure/docker/Dockerfile.web" ]; then
    echo "✅ Dockerfile.web exists"
else
    echo "❌ Dockerfile.web not found"
    exit 1
fi

if [ -f "infrastructure/docker/Dockerfile.api" ]; then
    echo "✅ Dockerfile.api exists"
else
    echo "❌ Dockerfile.api not found"
    exit 1
fi

if [ -f "infrastructure/docker/Dockerfile.pipeline" ]; then
    echo "✅ Dockerfile.pipeline exists"
else
    echo "❌ Dockerfile.pipeline not found"
    exit 1
fi

# Check if docker-compose files exist
echo ""
echo "Checking docker-compose files..."
if [ -f "infrastructure/docker/docker-compose.yml" ]; then
    echo "✅ docker-compose.yml exists"
else
    echo "❌ docker-compose.yml not found"
    exit 1
fi

if [ -f "infrastructure/docker/docker-compose.dev.yml" ]; then
    echo "✅ docker-compose.dev.yml exists"
else
    echo "❌ docker-compose.dev.yml not found"
    exit 1
fi

# Validate docker-compose files
echo ""
echo "Validating docker-compose files..."

# Helper function to run compose commands
compose_cmd() {
    if command -v docker-compose &> /dev/null; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

# Validate by checking if config command succeeds (exit code 0)
if compose_cmd -f infrastructure/docker/docker-compose.yml config >/dev/null 2>&1; then
    echo "✅ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has errors"
    exit 1
fi

if compose_cmd -f infrastructure/docker/docker-compose.dev.yml config >/dev/null 2>&1; then
    echo "✅ docker-compose.dev.yml is valid"
else
    echo "❌ docker-compose.dev.yml has errors"
    exit 1
fi

# Check if scripts exist and are executable
echo ""
echo "Checking helper scripts..."
for script in build.sh start.sh stop.sh clean.sh; do
    if [ -x "infrastructure/docker/scripts/$script" ]; then
        echo "✅ $script is executable"
    else
        echo "❌ $script is not executable or not found"
        exit 1
    fi
done

# Check if Makefile exists
echo ""
echo "Checking Makefile..."
if [ -f "Makefile" ]; then
    echo "✅ Makefile exists"
else
    echo "❌ Makefile not found"
    exit 1
fi

# Check if .dockerignore exists
echo ""
echo "Checking .dockerignore..."
if [ -f ".dockerignore" ]; then
    echo "✅ .dockerignore exists"
else
    echo "❌ .dockerignore not found"
    exit 1
fi

echo ""
echo "✅ All validation checks passed!"
echo ""
echo "You can now:"
echo "  - Start development: make dev-up"
echo "  - Start production: make build && make up"
echo "  - View help: make help"
