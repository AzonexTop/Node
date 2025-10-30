# Monorepo

A comprehensive monorepo setup using Turborepo with support for polyglot services (TypeScript/JavaScript and Python).

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
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run Python tests only
npm run test:python
```

### Linting

Lint all packages:

```bash
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

Format code:

```bash
npm run format

# Check formatting
npm run format:check
```

### Type Checking

Type check all TypeScript packages:

```bash
npm run typecheck

# Type check Python packages
npm run typecheck:python
```

### Storybook

View and develop UI components in isolation:

```bash
# Start Storybook development server
npm run storybook

# Build Storybook static files
npm run build-storybook
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

Build and run with Docker Compose:

```bash
cd infrastructure/docker
docker-compose up --build
```

See [infrastructure/docker/README.md](infrastructure/docker/README.md) for details.

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

The monorepo is designed to work with CI/CD pipelines. Turborepo's caching and task orchestration ensure efficient builds.

Example GitHub Actions workflow:

```yaml
- name: Install dependencies
  run: npm install

- name: Build
  run: npm run build

- name: Lint
  run: npm run lint

- name: Test
  run: npm run test

- name: Type check
  run: npm run typecheck
```

## Development Tools

This monorepo includes comprehensive development tooling:

- **ESLint**: Configured linting for TypeScript/JavaScript with shared configs
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Type checking with strict configurations
- **Husky**: Git hooks for pre-commit quality checks
- **Commitlint**: Conventional commit message enforcement
- **Testing**: Jest (Node.js), Vitest (React), pytest (Python)
- **Storybook**: Component development and documentation
- **Black**: Python code formatting
- **mypy**: Python type checking
- **Flake8**: Python linting

## Scripts Reference

### Development
- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all packages and apps

### Code Quality
- `npm run lint` - Lint all packages
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format all code (Prettier + Black)
- `npm run format:check` - Check code formatting
- `npm run typecheck` - Type check TypeScript packages
- `npm run typecheck:python` - Type check Python packages

### Testing
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI interface
- `npm run test:python` - Run Python tests only
- `npm run test:python:watch` - Run Python tests in watch mode

### Storybook
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook static files

### Maintenance
- `npm run clean` - Clean build artifacts
- `npm run prepare` - Set up git hooks

## Documentation

- **[Development Guide](./DEVELOPMENT.md)** - Comprehensive development workflow
- **[Testing Guide](./TESTING.md)** - Testing strategies and best practices
- **[Contributing Guide](./CONTRIBUTING.md)** - Contribution guidelines

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
