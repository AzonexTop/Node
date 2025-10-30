# Contributing Guide

Thank you for contributing to this monorepo!

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Python >= 3.9 (for Python packages)

### Installation

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (if working with Python packages)
pip install -r requirements-dev.txt
```

## Development Workflow

### Making Changes

1. Create a new branch from `main`
2. Make your changes
3. Test your changes locally
4. Commit with descriptive messages
5. Push and create a pull request

### Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific package
cd packages/shared && npm run test
```

### Code Quality

Before committing, ensure:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run typecheck

# Build all packages
npm run build
```

## Monorepo Structure

### Adding a New Package

#### TypeScript Package

1. Create directory: `packages/your-package`
2. Add `package.json`:
   ```json
   {
     "name": "@repo/your-package",
     "version": "0.0.0",
     "private": true
   }
   ```
3. Add `tsconfig.json` extending from `@repo/typescript-config`
4. Run `npm install` from root

#### Python Package

1. Create directory: `packages/your-python-package`
2. Add `setup.py` and `pyproject.toml`
3. Add `package.json` with npm scripts for Turbo integration
4. Install with `pip install -e .`

### Adding a New Application

Follow the same structure as existing apps in `apps/`:
- Add proper `package.json`
- Configure TypeScript/ESLint
- Add README with usage instructions

## Commit Guidelines

Use conventional commit messages:

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: updating build tasks, dependencies, etc.
```

## Code Style

- **TypeScript/JavaScript**: Follow ESLint and Prettier configurations
- **Python**: Follow PEP 8, use Black for formatting, Flake8 for linting
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic only

## Testing

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Aim for meaningful test coverage
- Use descriptive test names

## Pull Request Process

1. Update README if adding new features
2. Ensure all tests pass
3. Ensure code is formatted and linted
4. Request review from maintainers
5. Address review feedback
6. Squash commits if requested

## Questions?

Open an issue for questions or discussions.
