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

1. **Create a branch** following naming conventions:
   - `feat/description` - for new features
   - `fix/description` - for bug fixes
   - `docs/description` - for documentation
   - `refactor/description` - for code refactoring

2. **Write a descriptive PR title** following Conventional Commits:
   - `feat: Add user authentication`
   - `fix: Resolve API timeout issue`
   - `docs: Update installation guide`

3. **Ensure all CI checks pass**:
   - ✅ Lint (formatting and code quality)
   - ✅ Type Check (TypeScript type safety)
   - ✅ Test (unit tests pass)
   - ✅ Build (successful build)
   - ✅ PR Validation (title format, conflicts, file sizes)

4. **Run checks locally before pushing**:
   ```bash
   npm run format:check
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```

5. **Update documentation** if adding new features or changing behavior

6. **Request review** from maintainers

7. **Address review feedback** promptly

8. **Squash commits** if requested to maintain clean history

### CI/CD Integration

All pull requests automatically run through our CI pipeline:
- **Parallel execution** of lint, typecheck, test, and build jobs
- **Caching** for faster runs (Node.js, Python, Turbo)
- **Artifacts** uploaded for coverage reports and build outputs
- **Status badges** updated on PR

See [`.github/workflows/README.md`](.github/workflows/README.md) for detailed CI/CD information.

## Questions?

Open an issue for questions or discussions.
