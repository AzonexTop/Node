# Docker Infrastructure

Docker configurations for the monorepo applications.

## Usage

### Build and run all services

```bash
docker-compose up --build
```

### Run specific service

```bash
docker-compose up web
docker-compose up api
docker-compose up data-pipeline
```

### Stop all services

```bash
docker-compose down
```

### Clean up volumes

```bash
docker-compose down -v
```

## Services

- **web**: Next.js frontend (port 3000)
- **api**: Express.js backend (port 3001)
- **data-pipeline**: Python data pipeline

## Environment Variables

Create a `.env` file in the infrastructure/docker directory with:

```
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
```
