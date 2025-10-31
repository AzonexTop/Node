# AI-Driven Indian Markets Platform

[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![PR Validation](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-validation.yml)
[![Publish](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/publish.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/publish.yml)

A comprehensive monorepo setup using Turborepo with support for polyglot services (TypeScript/JavaScript and Python). This platform provides real-time market data analysis, AI-powered trading signals, portfolio management, and compliance monitoring for Indian financial markets.

## 📋 Documentation

### Architecture & Planning
- **[Architecture Blueprint](./docs/architecture/PLATFORM_BLUEPRINT.md)** - Comprehensive solution architecture
- **[Dependency Graph](./docs/architecture/DEPENDENCY_GRAPH.md)** - Service dependencies and data flows
- **[NFR Specifications](./docs/architecture/NFR_SPECIFICATIONS.md)** - Non-functional requirements
- **[Technology Decisions](./docs/architecture/TECHNOLOGY_DECISIONS.md)** - Technology stack rationale
- **[Implementation Roadmap](./docs/architecture/ROADMAP_VISUAL.md)** - 18-month phased roadmap

### Development & Operations
- **[CI/CD Workflows](./.github/workflows/README.md)** - GitHub Actions pipeline documentation

See [docs/architecture/README.md](./docs/architecture/README.md) for the complete architecture documentation index.

## Repository Structure

```
.
├── apps/
│   ├── web/                    # Next.js frontend application
│   ├── api/                    # Node.js/Express backend service
│   └── data-pipeline/          # Python data pipeline application
├── packages/
│   ├── shared/                 # Shared TypeScript utilities
│   ├── ui/                     # Shared React components
│   ├── python-shared/          # Shared Python utilities
│   ├── eslint-config/          # Shared ESLint configurations
│   └── typescript-config/      # Shared TypeScript configurations
├── infrastructure/
│   ├── docker/                 # Docker configurations
│   └── terraform/              # Terraform infrastructure definitions
├── docs/
│   └── architecture/           # Platform architecture documentation
│       ├── PLATFORM_BLUEPRINT.md
│       ├── DEPENDENCY_GRAPH.md
│       ├── NFR_SPECIFICATIONS.md
│       ├── TECHNOLOGY_DECISIONS.md
│       └── ROADMAP_VISUAL.md
├── turbo.json                  # Turborepo pipeline configuration
├── package.json                # Root package configuration
└── tsconfig.json               # Base TypeScript configuration
```

## Prerequisites

### Node.js/TypeScript Projects
- Node.js >= 18.0.0
- npm >= 9.0.0

### Python Projects
- Python >= 3.9
- pip

## Getting Started

### Installation

Install all dependencies:

```bash
npm install
```

### Development

Run all applications in development mode:

```bash
npm run dev
```

Run specific application:

```bash
# Frontend only
cd apps/web && npm run dev

# Backend API only
cd apps/api && npm run dev

# Data pipeline
cd apps/data-pipeline && npm run dev
```

### Building

Build all applications:

```bash
npm run build
```

Build specific application:

```bash
# Using turbo
npm run build -- --filter=web
npm run build -- --filter=api

# Or directly
cd apps/web && npm run build
```

### Testing

Run tests across all packages:

```bash
npm run test
```

### Linting

Lint all packages:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

### Type Checking

Type check all TypeScript packages:

```bash
npm run typecheck
```

## Applications

### Web (`apps/web`)
Next.js frontend application with:
- Server-side rendering
- Shared UI components from `@repo/ui`
- Shared utilities from `@repo/shared`

**Port**: 3000

### API (`apps/api`)
Express.js backend service with:
- RESTful API endpoints
- CORS support
- Shared utilities from `@repo/shared`

**Port**: 3001

### Data Pipeline (`apps/data-pipeline`)
Python data pipeline with:
- Data processing capabilities
- Shared Python utilities from `repo-python-shared`
- Environment-based configuration

## Packages

### @repo/shared
Shared TypeScript utilities and types used across Node.js applications.

### @repo/ui
Shared React component library for frontend applications.

### @repo/python-shared
Shared Python utilities and models for Python applications.

### @repo/eslint-config
Shared ESLint configurations:
- `@repo/eslint-config/base`: Base configuration
- `@repo/eslint-config/node`: Node.js configuration
- `@repo/eslint-config/react`: React configuration
- `@repo/eslint-config/nextjs`: Next.js configuration

### @repo/typescript-config
Shared TypeScript configurations:
- `base.json`: Base configuration
- `node.json`: Node.js configuration
- `react.json`: React library configuration
- `nextjs.json`: Next.js configuration

## Infrastructure

### Docker

The monorepo includes comprehensive Docker configurations for local development and production deployment:

**Quick Start (Development)**:
```bash
# Using Make (recommended)
make dev-up

# Or using scripts
./infrastructure/docker/scripts/start.sh dev
```

**Production Build**:
```bash
make build
make up
```

**Features**:
- Multi-stage Dockerfiles optimized for each service type
- PostgreSQL with TimescaleDB extension
- MongoDB, Redis, and Elasticsearch
- Hot-reload support in development mode
- Production-ready health checks
- Makefile for easy operations

See [infrastructure/docker/README.md](infrastructure/docker/README.md) for comprehensive documentation.

### Terraform

Initialize and apply infrastructure:

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

See [infrastructure/terraform/README.md](infrastructure/terraform/README.md) for details.

## Environment Variables

Each application has its own `.env.example` file. Copy these to `.env` (or `.env.local` for Next.js) and configure:

- **Root**: `.env.example` - Global environment variables
- **Web**: `apps/web/.env.local.example`
- **API**: `apps/api/.env.example`
- **Data Pipeline**: `apps/data-pipeline/.env.example`

## Turborepo Pipeline

The monorepo uses Turborepo for efficient task orchestration. The pipeline is configured in `turbo.json`:

- **build**: Builds packages with dependencies
- **dev**: Runs development servers (no cache)
- **lint**: Lints code
- **test**: Runs tests with coverage
- **typecheck**: Type checks TypeScript code

## Adding New Packages

### TypeScript Package

1. Create directory in `packages/` or `apps/`
2. Add `package.json` with name `@repo/package-name`
3. Create `tsconfig.json` extending from `@repo/typescript-config`
4. Add to root `package.json` workspaces (auto-detected with `apps/*` and `packages/*`)

### Python Package

1. Create directory in `packages/` or `apps/`
2. Add `setup.py` and `pyproject.toml`
3. Add `package.json` with build/test scripts for Turborepo integration
4. Install with `pip install -e .`

## Workspace Dependencies

Reference workspace packages in `package.json`:

```json
{
  "dependencies": {
    "@repo/shared": "*",
    "@repo/ui": "*"
  }
}
```

For Python packages, install with:

```bash
pip install -e ../../packages/python-shared
```

## CI/CD

The monorepo uses GitHub Actions for continuous integration and deployment. All workflows are configured to run lint, tests, type checks, and builds with efficient caching for both Node.js and Python dependencies.

### Workflows

- **CI**: Runs on every push and PR to `main`/`develop` branches
  - Lint checks (ESLint, Prettier, Flake8, Black, mypy)
  - Type checking (TypeScript)
  - Unit tests (Jest, pytest)
  - Build verification
  - Artifact uploads (build outputs, coverage reports)

- **PR Validation**: Validates pull requests
  - Conventional Commits format
  - Merge conflict detection
  - Large file detection
  - PR size warnings

- **Publish Artifacts**: Builds and publishes on releases
  - Creates versioned archives of all apps
  - Builds Docker images
  - Attaches artifacts to GitHub releases

- **Cache Warmup**: Weekly cache optimization
- **Dependency Review**: Security checks on dependency updates

### Required Checks for PRs

The following checks must pass before merging:
- ✅ Lint
- ✅ Type Check
- ✅ Test
- ✅ Build
- ✅ Validate PR

### Branch Protection

Configure branch protection rules for `main`:
1. Require pull request reviews (1+ approvals)
2. Require status checks to pass
3. Require conversation resolution

See [`.github/workflows/README.md`](.github/workflows/README.md) for detailed CI/CD documentation.

### Running Checks Locally

```bash
# Format code
npm run format

# Run all checks
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

## Scripts Reference

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all packages and apps
- `npm run lint` - Lint all packages
- `npm run test` - Run tests across all packages
- `npm run typecheck` - Type check all TypeScript packages
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run clean` - Clean build artifacts

## Best Practices

1. **Shared Code**: Place reusable code in `packages/`
2. **Type Safety**: Use TypeScript project references for better IDE support
3. **Environment Variables**: Never commit `.env` files, use `.env.example` templates
4. **Dependencies**: Prefer workspace dependencies over npm packages where possible
5. **Builds**: Build shared packages before dependent applications
6. **Testing**: Write tests for shared packages and critical application logic

## Troubleshooting

### Build Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Type Errors

```bash
# Rebuild TypeScript project references
npm run build
npm run typecheck
```

### Python Issues

```bash
# Reinstall Python packages
cd apps/data-pipeline
pip install -e . --force-reinstall
pip install -e ../../packages/python-shared --force-reinstall
```

## License

[Your License Here]

## Contributing

[Your Contributing Guidelines Here]
