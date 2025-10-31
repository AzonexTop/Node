# Docker Infrastructure

Comprehensive Docker configurations for the monorepo, including multi-stage Dockerfiles for all application services and development databases.

## Overview

This directory contains:
- **Multi-stage Dockerfiles** for optimized production builds
- **docker-compose.yml** for production orchestration
- **docker-compose.dev.yml** for local development with hot-reload
- **Helper scripts** for common operations
- **Makefile** for convenient commands

## Quick Start

### Using Make (Recommended)

```bash
# Development mode with hot-reload
make dev-up

# Production mode
make build
make up

# View logs
make dev-logs  # or make logs for production

# Stop services
make dev-down  # or make down for production

# Clean up everything
make clean
```

### Using Scripts

```bash
# Start development environment
./infrastructure/docker/scripts/start.sh dev

# Start production environment
./infrastructure/docker/scripts/start.sh prod

# Stop environment
./infrastructure/docker/scripts/stop.sh dev  # or prod

# Clean up everything
./infrastructure/docker/scripts/clean.sh
```

### Using Docker Compose Directly

```bash
# Development
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d

# Production
docker-compose -f infrastructure/docker/docker-compose.yml up --build -d
```

## Services

### Application Services

#### Web (Next.js)
- **Port**: 3000
- **Dockerfile**: `Dockerfile.web`
- **Features**: Multi-stage build with Turbo pruning, standalone output
- **Dev mode**: Hot-reload enabled with volume mounts

#### API (Express)
- **Port**: 3001
- **Dockerfile**: `Dockerfile.api`
- **Features**: Multi-stage build with TypeScript compilation
- **Dev mode**: Hot-reload with tsx watch mode

#### Data Pipeline (Python)
- **Dockerfile**: `Dockerfile.pipeline`
- **Features**: Multi-stage build with optimized dependencies
- **Dev mode**: Volume mounts for live code changes

### Database Services

#### PostgreSQL with TimescaleDB
- **Port**: 5432
- **Image**: `timescale/timescaledb:latest-pg16`
- **Default credentials**: `postgres/postgres`
- **Database**: `monorepo`
- **Features**: Time-series data support

#### MongoDB
- **Port**: 27017
- **Image**: `mongo:7`
- **Database**: `monorepo`
- **Features**: Document store

#### Redis
- **Port**: 6379
- **Image**: `redis:7-alpine`
- **Features**: In-memory cache and message broker

#### Elasticsearch
- **Port**: 9200 (HTTP), 9300 (Transport)
- **Image**: `elasticsearch:8.11.0`
- **Features**: Full-text search and analytics
- **Memory**: 512MB allocated

## Docker Files

### Dockerfiles

#### Dockerfile.web
Multi-stage build for Next.js:
1. **Builder**: Prunes workspace with Turbo
2. **Installer**: Installs dependencies and builds
3. **Runner**: Lightweight production image with standalone output

#### Dockerfile.api
Multi-stage build for Express API:
1. **Builder**: Prunes workspace with Turbo
2. **Installer**: Installs dependencies and compiles TypeScript
3. **Runner**: Production image with compiled JavaScript

#### Dockerfile.pipeline
Multi-stage build for Python pipeline:
1. **Base**: Installs system dependencies
2. **Builder**: Installs Python packages
3. **Runner**: Lightweight image with only runtime dependencies

## Environment Variables

### Production (docker-compose.yml)
All services use hardcoded development credentials. For production deployment, override these with environment-specific values.

### Development (docker-compose.dev.yml)
Development environment includes volume mounts for hot-reloading:
- Source code is mounted into containers
- Node modules and build outputs are preserved in volumes
- Changes to source files trigger automatic rebuilds

## Common Operations

### Start Only Databases

```bash
make db-only
```

This is useful when you want to run application services locally but use containerized databases.

### Access Database Shells

```bash
# PostgreSQL
make db-shell-pg
# or: docker-compose -f infrastructure/docker/docker-compose.dev.yml exec postgres psql -U postgres -d monorepo

# MongoDB
make db-shell-mongo
# or: docker-compose -f infrastructure/docker/docker-compose.dev.yml exec mongo mongosh monorepo

# Redis
make db-shell-redis
# or: docker-compose -f infrastructure/docker/docker-compose.dev.yml exec redis redis-cli
```

### View Service Logs

```bash
# All services
make logs

# Specific service
make web-logs
make api-logs
make pipeline-logs

# Development services
make dev-logs
```

### Rebuild Without Cache

```bash
make test-build
```

### Check Container Status

```bash
make ps
```

### Monitor Resource Usage

```bash
make stats
```

## Network Architecture

All services communicate through a shared bridge network (`monorepo-network`):
- Services can reference each other by service name
- Internal DNS resolution provided by Docker
- External ports mapped for local access

## Volume Management

### Production Volumes
- `postgres-data`: PostgreSQL data
- `mongo-data`: MongoDB data
- `redis-data`: Redis persistence
- `elasticsearch-data`: Elasticsearch indices
- `pipeline-data`: Pipeline output data

### Development Volumes
Separate volumes for development to avoid conflicts:
- `postgres-data-dev`
- `mongo-data-dev`
- `redis-data-dev`
- `elasticsearch-data-dev`

To remove all data and start fresh:
```bash
make clean  # or make dev-clean
```

## Development Workflow

1. **Start development environment**:
   ```bash
   make dev-up
   ```

2. **Make code changes** - they'll be reflected immediately due to hot-reload

3. **View logs** to debug:
   ```bash
   make dev-logs
   ```

4. **Access databases** as needed:
   ```bash
   make db-shell-pg
   ```

5. **Stop when done**:
   ```bash
   make dev-down
   ```

## Production Deployment

1. **Build images**:
   ```bash
   make build
   ```

2. **Start services**:
   ```bash
   make up
   ```

3. **Check status**:
   ```bash
   make ps
   ```

4. **View logs**:
   ```bash
   make logs
   ```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f infrastructure/docker/docker-compose.yml logs <service-name>

# Rebuild without cache
make test-build
```

### Port already in use
Stop the conflicting service or change the port mapping in the compose file.

### Database connection issues
Ensure databases are healthy:
```bash
docker-compose -f infrastructure/docker/docker-compose.yml ps
```

Look for "healthy" status. If unhealthy, check logs:
```bash
docker-compose -f infrastructure/docker/docker-compose.yml logs postgres
```

### Out of disk space
Clean up unused Docker resources:
```bash
make clean
docker system prune -a --volumes
```

### Permission errors
Ensure scripts are executable:
```bash
chmod +x infrastructure/docker/scripts/*.sh
```

## Performance Optimization

### For Development
- Use volume mounts for hot-reload (already configured in dev compose)
- Allocate sufficient memory to Docker (recommended: 4GB+)
- Use BuildKit for faster builds: `export DOCKER_BUILDKIT=1`

### For Production
- Multi-stage builds minimize image size
- Non-root users improve security
- Health checks ensure service reliability
- Resource limits prevent runaway processes

## Security Notes

**These configurations are for development only.** For production:
- Use strong, unique passwords
- Enable authentication on all databases
- Use secrets management (Docker secrets, Vault, etc.)
- Run containers with read-only root filesystems where possible
- Scan images for vulnerabilities
- Use private registries

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Turbo Documentation](https://turbo.build/repo/docs)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
