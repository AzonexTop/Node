# Docker Quick Reference

This is a quick reference guide for using Docker with this monorepo. For comprehensive documentation, see [infrastructure/docker/README.md](infrastructure/docker/README.md).

## Quick Start

### Development Mode (with hot-reload)

```bash
# Start all services
make dev-up

# View logs
make dev-logs

# Stop services
make dev-down
```

### Production Mode

```bash
# Build and start
make build
make up

# View logs
make logs

# Stop services
make down
```

## Available Services

Once started, the following services are available:

| Service | URL | Description |
|---------|-----|-------------|
| Web | http://localhost:3000 | Next.js frontend |
| API | http://localhost:3001 | Express backend |
| PostgreSQL | localhost:5432 | Postgres + TimescaleDB |
| MongoDB | localhost:27017 | MongoDB database |
| Redis | localhost:6379 | Redis cache |
| Elasticsearch | http://localhost:9200 | Search engine |

**Default Credentials**:
- PostgreSQL: `postgres/postgres`
- MongoDB: No authentication (dev only)
- Redis: No authentication (dev only)
- Elasticsearch: No authentication (dev only)

## Common Commands

### Using Make (Recommended)

```bash
make help              # Show all available commands
make dev-up            # Start development environment
make dev-down          # Stop development environment
make dev-logs          # View development logs
make db-only           # Start only databases
make db-shell-pg       # Open PostgreSQL shell
make db-shell-mongo    # Open MongoDB shell
make db-shell-redis    # Open Redis CLI
make clean             # Clean up everything
```

### Using Scripts

```bash
# Start
./infrastructure/docker/scripts/start.sh dev   # Development
./infrastructure/docker/scripts/start.sh prod  # Production

# Stop
./infrastructure/docker/scripts/stop.sh dev    # Development
./infrastructure/docker/scripts/stop.sh prod   # Production

# Clean
./infrastructure/docker/scripts/clean.sh
```

### Using Docker Compose Directly

```bash
# Development
docker-compose -f infrastructure/docker/docker-compose.dev.yml up -d
docker-compose -f infrastructure/docker/docker-compose.dev.yml down

# Production
docker-compose -f infrastructure/docker/docker-compose.yml up --build -d
docker-compose -f infrastructure/docker/docker-compose.yml down
```

## Typical Workflows

### Local Development with Databases

If you want to run your application locally but use containerized databases:

```bash
# Start only databases
make db-only

# In separate terminals, run your apps locally
npm run dev --filter=web
npm run dev --filter=api
cd apps/data-pipeline && python src/pipeline/main.py
```

### Full Containerized Development

Everything runs in containers with hot-reload:

```bash
make dev-up
make dev-logs  # Watch logs in real-time
```

### Testing Production Builds Locally

```bash
make build
make up
```

## Troubleshooting

### Port Already in Use

Change the port mapping in `docker-compose.yml` or create a `docker-compose.override.yml`:

```yaml
services:
  web:
    ports:
      - "3002:3000"  # Use port 3002 instead of 3000
```

### Container Won't Start

```bash
# Check logs
make logs

# Rebuild without cache
make test-build

# Clean and restart
make clean
make dev-up
```

### Database Connection Issues

```bash
# Check container status
docker ps

# Check database health
docker-compose -f infrastructure/docker/docker-compose.yml ps

# View database logs
docker-compose -f infrastructure/docker/docker-compose.yml logs postgres
```

### Out of Disk Space

```bash
# Clean up this project
make clean

# Clean up Docker system-wide
docker system prune -a --volumes
```

## Environment Variables

Copy `.env.example` to `.env` and customize as needed:

```bash
cp .env.example .env
```

The Docker Compose files will automatically pick up variables from `.env`.

## Data Persistence

Data is stored in Docker volumes:
- `postgres-data` / `postgres-data-dev`
- `mongo-data` / `mongo-data-dev`
- `redis-data` / `redis-data-dev`
- `elasticsearch-data` / `elasticsearch-data-dev`

To remove all data and start fresh:

```bash
make clean
```

## Next Steps

- Read the [comprehensive Docker documentation](infrastructure/docker/README.md)
- Explore the [Dockerfiles](infrastructure/docker/)
- Customize with `docker-compose.override.yml`
- Check the [main README](README.md) for project overview
