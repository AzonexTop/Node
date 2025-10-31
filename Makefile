.PHONY: help build up down restart logs clean dev-up dev-down dev-restart dev-logs db-only test-build

# Detect docker-compose command (standalone or plugin)
DOCKER_COMPOSE_CMD := $(shell command -v docker-compose 2> /dev/null)
ifndef DOCKER_COMPOSE_CMD
	DOCKER_COMPOSE_CMD := docker compose
endif

DOCKER_COMPOSE := $(DOCKER_COMPOSE_CMD) -f infrastructure/docker/docker-compose.yml
DOCKER_COMPOSE_DEV := $(DOCKER_COMPOSE_CMD) -f infrastructure/docker/docker-compose.dev.yml

help:
	@echo "Container Management Commands:"
	@echo "  make build          - Build all production containers"
	@echo "  make up             - Start all production services"
	@echo "  make down           - Stop all production services"
	@echo "  make restart        - Restart all production services"
	@echo "  make logs           - View logs from all production services"
	@echo "  make clean          - Stop services and remove volumes"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev-up         - Start all development services with hot-reload"
	@echo "  make dev-down       - Stop all development services"
	@echo "  make dev-restart    - Restart all development services"
	@echo "  make dev-logs       - View logs from all development services"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-only        - Start only database services"
	@echo "  make db-shell-pg    - Open PostgreSQL shell"
	@echo "  make db-shell-mongo - Open MongoDB shell"
	@echo "  make db-shell-redis - Open Redis CLI"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make test-build     - Test build all containers without cache"
	@echo "  make ps             - List all running containers"
	@echo "  make stats          - Show container resource usage"

# Production Commands
build:
	@echo "Building production containers..."
	$(DOCKER_COMPOSE) build

up:
	@echo "Starting production services..."
	$(DOCKER_COMPOSE) up -d

down:
	@echo "Stopping production services..."
	$(DOCKER_COMPOSE) down

restart: down up

logs:
	$(DOCKER_COMPOSE) logs -f

clean:
	@echo "Cleaning up all containers and volumes..."
	$(DOCKER_COMPOSE) down -v
	@echo "Removing dangling images..."
	docker image prune -f

# Development Commands
dev-up:
	@echo "Starting development services with hot-reload..."
	$(DOCKER_COMPOSE_DEV) up -d

dev-down:
	@echo "Stopping development services..."
	$(DOCKER_COMPOSE_DEV) down

dev-restart: dev-down dev-up

dev-logs:
	$(DOCKER_COMPOSE_DEV) logs -f

dev-clean:
	@echo "Cleaning up development containers and volumes..."
	$(DOCKER_COMPOSE_DEV) down -v

# Database Commands
db-only:
	@echo "Starting only database services..."
	$(DOCKER_COMPOSE_DEV) up -d postgres mongo redis elasticsearch

db-shell-pg:
	@echo "Opening PostgreSQL shell..."
	$(DOCKER_COMPOSE_DEV) exec postgres psql -U postgres -d monorepo

db-shell-mongo:
	@echo "Opening MongoDB shell..."
	$(DOCKER_COMPOSE_DEV) exec mongo mongosh monorepo

db-shell-redis:
	@echo "Opening Redis CLI..."
	$(DOCKER_COMPOSE_DEV) exec redis redis-cli

# Service-specific commands
web-logs:
	$(DOCKER_COMPOSE) logs -f web

api-logs:
	$(DOCKER_COMPOSE) logs -f api

pipeline-logs:
	$(DOCKER_COMPOSE) logs -f data-pipeline

# Utility Commands
test-build:
	@echo "Testing build without cache..."
	$(DOCKER_COMPOSE) build --no-cache

ps:
	@echo "Production services:"
	$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "Development services:"
	$(DOCKER_COMPOSE_DEV) ps

stats:
	docker stats

# Individual service commands
web:
	$(DOCKER_COMPOSE) up web

api:
	$(DOCKER_COMPOSE) up api

pipeline:
	$(DOCKER_COMPOSE) up data-pipeline
