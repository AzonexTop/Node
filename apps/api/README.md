# API Service

Express.js backend API service.

## Getting Started

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm run start

# Lint
npm run lint

# Type check
npm run typecheck

# Test
npm run test
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `PORT`: Server port (default: 3001)
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret for JWT signing
- `CORS_ORIGIN`: Allowed CORS origin

## Endpoints

- `GET /health`: Health check endpoint
- `GET /api/hello`: Example API endpoint

## Dependencies

- `@repo/shared`: Shared utilities and types
