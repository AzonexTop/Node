# Testing Guide

This guide covers testing strategies and best practices for the monorepo.

## Overview

The monorepo uses different testing frameworks for different parts of the stack:

- **Node.js/TypeScript**: Jest for API testing
- **React/Next.js**: Vitest for component testing
- **Python**: pytest for backend testing

## Table of Contents

- [JavaScript/TypeScript Testing](#javascripttypescript-testing)
- [Python Testing](#python-testing)
- [Test Organization](#test-organization)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## JavaScript/TypeScript Testing

### API Testing (Jest)

The API uses Jest with Supertest for endpoint testing.

#### Test Structure
```
apps/api/src/
├── index.test.ts          # Main application tests
├── test/
│   └── setup.ts          # Test configuration
└── jest.config.js        # Jest configuration
```

#### Example Test
```typescript
import request from 'supertest';
import app from './index';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('status', 'healthy');
    });
  });
});
```

#### Running Tests
```bash
# Run all API tests
turbo run test --filter=api

# Run tests in watch mode
turbo run test:watch --filter=api

# Run tests with coverage
turbo run test --filter=api -- --coverage
```

### Component Testing (Vitest)

The web app uses Vitest with React Testing Library for component testing.

#### Test Structure
```
apps/web/
├── app/
│   ├── page.tsx
│   └── page.test.tsx      # Component tests
├── src/
│   └── test/
│       └── setup.ts       # Test configuration
└── vitest.config.ts       # Vitest configuration
```

#### Example Test
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './page';

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /welcome to the monorepo/i })).toBeInTheDocument();
  });

  it('shows alert when button is clicked', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Home />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    expect(alertSpy).toHaveBeenCalledWith('Button clicked!');
    alertSpy.mockRestore();
  });
});
```

#### Running Tests
```bash
# Run all web tests
turbo run test --filter=web

# Run tests in watch mode
turbo run test:watch --filter=web

# Run tests with UI
turbo run test:ui --filter=web

# Run tests for specific file
npx vitest run app/page.test.tsx
```

## Python Testing

Python packages use pytest for testing.

### Test Structure
```
packages/python-shared/
├── src/
│   └── repo_shared/
│       ├── utils.py
│       └── models.py
└── tests/
    ├── __init__.py
    ├── test_utils.py       # Utility tests
    └── test_models.py      # Model tests
```

### Example Test
```python
import pytest
from datetime import datetime
from repo_shared.utils import format_timestamp, validate_config


class TestFormatTimestamp:
    """Test cases for the format_timestamp function."""

    def test_format_timestamp_utc(self):
        """Test formatting a UTC datetime."""
        dt = datetime(2023, 12, 1, 10, 30, 0)
        result = format_timestamp(dt)
        assert result == "2023-12-01T10:30:00"

    def test_format_timestamp_with_timezone(self):
        """Test formatting a datetime with timezone."""
        dt = datetime(2023, 12, 1, 10, 30, 0, tzinfo=timezone.utc)
        result = format_timestamp(dt)
        assert result == "2023-12-01T10:30:00+00:00"


class TestValidateConfig:
    """Test cases for the validate_config function."""

    def test_validate_config_valid(self):
        """Test validation of a valid configuration."""
        config = {
            "environment": "production",
            "version": "1.0.0",
            "debug": True,
            "timeout": 30
        }
        assert validate_config(config) is True

    def test_validate_config_missing_required(self):
        """Test validation when required keys are missing."""
        config = {"debug": True}
        assert validate_config(config) is False
```

### Running Tests
```bash
# Run all Python tests
npm run test:python

# Run tests in watch mode
npm run test:python:watch

# Run tests with coverage
pytest packages/python-shared/tests apps/data-pipeline/tests --cov=repo_shared --cov=pipeline --cov-report=html

# Run specific test file
pytest packages/python-shared/tests/test_utils.py -v

# Run specific test method
pytest packages/python-shared/tests/test_utils.py::TestFormatTimestamp::test_format_timestamp_utc -v
```

## Test Organization

### File Naming Conventions

#### JavaScript/TypeScript
- Test files: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
- Test directories: `__tests__/`, `test/`

#### Python
- Test files: `test_*.py`, `*_test.py`
- Test directories: `tests/`

### Test Structure

#### Arrange-Act-Assert Pattern
```typescript
// Arrange
const mockData = { id: 1, name: 'Test' };
const mockFn = jest.fn();

// Act
const result = process(mockData, mockFn);

// Assert
expect(result).toEqual({ processed: true });
expect(mockFn).toHaveBeenCalledWith(mockData);
```

#### Descriptive Test Names
```typescript
// Good
it('should return user data when valid ID is provided', () => {
  // Test implementation
});

// Bad
it('works', () => {
  // Test implementation
});
```

### Test Categories

#### Unit Tests
- Test individual functions/components in isolation
- Fast and focused
- Mock external dependencies

#### Integration Tests
- Test multiple components working together
- Test database interactions
- Test API endpoints

#### End-to-End Tests
- Test complete user flows
- Test across multiple services
- Slower but comprehensive

## Best Practices

### General Testing Principles

1. **Test Behavior, Not Implementation**
   ```typescript
   // Good - tests what the function does
   expect(result).toEqual({ success: true });
   
   // Bad - tests how the function works
   expect(mockFn).toHaveBeenCalledTimes(2);
   ```

2. **Use Descriptive Test Names**
   - Test names should describe the scenario and expected outcome
   - Use "should" or "when" in test names

3. **One Assertion Per Test**
   ```typescript
   // Good
   it('should return success status', () => {
     expect(result.success).toBe(true);
   });
   
   it('should include user data', () => {
     expect(result.data).toHaveProperty('user');
   });
   ```

4. **Use Test Doubles Appropriately**
   - Mocks: Verify behavior
   - Stubs: Provide data
   - Spies: Record calls

### JavaScript/TypeScript Specific

1. **Mock External Dependencies**
   ```typescript
   vi.mock('@repo/shared', () => ({
     formatDate: vi.fn(() => '2023-12-01'),
   }));
   ```

2. **Test Component Interactions**
   ```typescript
   const button = screen.getByRole('button');
   fireEvent.click(button);
   expect(mockFn).toHaveBeenCalled();
   ```

3. **Use Testing Library Queries**
   ```typescript
   // Good - accessible queries
   screen.getByRole('button', { name: /submit/i });
   
   // Avoid - implementation details
   container.querySelector('button[type="submit"]');
   ```

### Python Specific

1. **Use Fixtures for Setup**
   ```python
   @pytest.fixture
   def sample_config():
       return {"environment": "test", "version": "1.0.0"}
   
   def test_validate_config(sample_config):
       assert validate_config(sample_config) is True
   ```

2. **Mock External Dependencies**
   ```python
   @patch('pipeline.main.format_timestamp')
   def test_run_pipeline(mock_format_timestamp):
       mock_format_timestamp.return_value = "2023-12-01 10:30:00"
       # Test implementation
   ```

3. **Use Parametrized Tests**
   ```python
   @pytest.mark.parametrize("input,expected", [
       ({"env": "prod"}, True),
       ({"env": "dev"}, True),
       ({}, False),
   ])
   def test_validate_config_cases(input, expected):
       assert validate_config(input) is expected
   ```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          npm install
          pip install -r requirements-dev.txt
      
      - name: Run tests
        run: |
          npm run test
          npm run test:python
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Quality Gates

- All tests must pass before merging
- Coverage thresholds enforced
- Linting and type checking required
- Security scanning for dependencies

## Coverage

### JavaScript/TypeScript
```bash
# Generate coverage report
turbo run test -- --coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Python
```bash
# Generate coverage report
pytest --cov=repo_shared --cov=pipeline --cov-report=html

# View coverage in browser
open htmlcov/index.html
```

### Coverage Targets
- **Unit Tests**: 80% minimum coverage
- **Integration Tests**: 70% minimum coverage
- **Critical Paths**: 90% minimum coverage

## Debugging Tests

### JavaScript/TypeScript
```bash
# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Debug specific test
npx vitest run --no-coverage app/page.test.tsx
```

### Python
```bash
# Debug with pdb
pytest --pdb

# Debug specific test
pytest -s -vv packages/python-shared/tests/test_utils.py::TestFormatTimestamp::test_format_timestamp_utc
```

## Performance Testing

### Load Testing
- Use tools like Artillery.js for API load testing
- Use Locust for Python service load testing
- Test under realistic conditions

### Benchmarking
- Benchmark critical functions
- Monitor performance regressions
- Set performance budgets

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [pytest Documentation](https://docs.pytest.org/en/stable/)

### Best Practices
- [Testing Best Practices](https://kentcdodds.com/blog/common-testing-mistakes)
- [React Testing Patterns](https://kentcdodds.com/blog/testing-implementation-details)
- [Python Testing Guidelines](https://docs.python-guide.org/writing/tests/)