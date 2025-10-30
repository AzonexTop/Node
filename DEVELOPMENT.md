# Development Guide

This guide covers the development tools and workflows available in this monorepo.

## Table of Contents

- [Setup](#setup)
- [Code Quality](#code-quality)
- [Testing](#testing)
- [Git Workflow](#git-workflow)
- [Storybook](#storybook)
- [Package Development](#package-development)

## Setup

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Python >= 3.9

### Installation

1. Install Node.js dependencies:
```bash
npm install
```

2. Install Python dependencies:
```bash
pip install -r requirements-dev.txt
```

3. Set up git hooks:
```bash
npm run prepare
```

## Code Quality

### Linting

#### TypeScript/JavaScript
```bash
# Lint all packages
npm run lint

# Lint specific package
turbo run lint --filter=@repo/ui

# Auto-fix linting issues
npm run lint:fix
```

#### Python
```bash
# Lint Python code
flake8 packages/python-shared/src apps/data-pipeline/src
```

### Formatting

#### TypeScript/JavaScript
```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

#### Python
```bash
# Format Python code (included in npm run format)
black packages/python-shared/src apps/data-pipeline/src packages/python-shared/tests apps/data-pipeline/tests

# Check formatting
black --check packages/python-shared/src apps/data-pipeline/src packages/python-shared/tests apps/data-pipeline/tests
```

### Type Checking

#### TypeScript
```bash
# Type check all packages
npm run typecheck

# Type check specific package
turbo run typecheck --filter=web
```

#### Python
```bash
# Type check Python code
npm run typecheck:python
```

## Testing

### JavaScript/TypeScript Testing

#### Run Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests for specific package
turbo run test --filter=api
```

#### Test Frameworks
- **API (Node.js)**: Jest with Supertest
- **Web (Next.js)**: Vitest with React Testing Library

#### Coverage
Test coverage reports are generated in the `coverage/` directory for each package.

### Python Testing

```bash
# Run all Python tests
npm run test:python

# Run tests in watch mode
npm run test:python:watch

# Run tests with coverage
pytest packages/python-shared/tests apps/data-pipeline/tests --cov=repo_shared --cov=pipeline --cov-report=html

# Run specific test file
pytest packages/python-shared/tests/test_utils.py -v
```

#### Test Structure
- Test files should be named `test_*.py` or `*_test.py`
- Test classes should be named `Test*`
- Test methods should be named `test_*`

## Git Workflow

### Commit Messages

This project uses conventional commits enforced by Commitlint:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI configuration changes
- `build`: Build system changes
- `revert`: Revert previous commit

#### Examples
```bash
feat(ui): add button component
fix(api): handle null response in endpoint
test(web): add unit tests for home page
docs(readme): update installation instructions
```

### Pre-commit Hooks

Husky is configured to run lint-staged on pre-commit:
- ESLint and Prettier for TypeScript/JavaScript files
- Black and Flake8 for Python files

### Commit Message Hook

Commitlint enforces conventional commit message format on commit-msg.

## Storybook

Storybook is set up for the UI package to develop and test components in isolation.

### Running Storybook
```bash
# Start Storybook development server
npm run storybook

# Build Storybook static files
npm run build-storybook
```

### Writing Stories

Stories are located alongside components in `src/` with the `.stories.tsx` extension.

Example:
```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  // ... configuration
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};
```

## Package Development

### Creating New Packages

#### TypeScript Package
1. Create directory in `packages/`
2. Add `package.json` with `@repo/` naming convention
3. Configure TypeScript to extend `@repo/typescript-config`
4. Configure ESLint to extend `@repo/eslint-config`

#### Python Package
1. Create directory in `packages/`
2. Add `pyproject.toml` with `repo-` naming convention
3. Configure tools in `pyproject.toml` (Black, mypy, pytest)

### Workspace Dependencies

#### TypeScript
Use workspace dependencies with `*` version:
```json
{
  "dependencies": {
    "@repo/shared": "*",
    "@repo/ui": "*"
  }
}
```

#### Python
Install in development mode:
```bash
pip install -e ./packages/python-shared
```

### Build Scripts

All packages should implement these scripts in their `package.json`:
- `build`: Build the package
- `dev`: Start development mode
- `lint`: Run linter
- `typecheck`: Run type checker
- `test`: Run tests
- `clean`: Clean build artifacts

## Development Workflow

1. **Start Development**
   ```bash
   # Start all apps in development mode
   npm run dev
   ```

2. **Make Changes**
   - Write code following the style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Quality Checks**
   ```bash
   # Run all quality checks
   npm run lint
   npm run typecheck
   npm run test
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and Create PR**
   - Push to feature branch
   - Create pull request
   - CI will run all checks automatically

## Troubleshooting

### Common Issues

#### TypeScript Errors
- Ensure all dependencies are installed
- Check that workspace dependencies are using `*` version
- Run `npm run clean && npm install` if cache issues occur

#### Python Import Errors
- Ensure packages are installed in development mode
- Check PYTHONPATH includes source directories
- Run `pip install -e .` for local packages

#### Test Failures
- Check that test files follow naming conventions
- Ensure test environment variables are set
- Run tests with `-v` flag for verbose output

### Getting Help

- Check existing issues in the repository
- Review the documentation in each package
- Ask questions in team channels