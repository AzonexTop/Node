# Data Pipeline

Python-based data pipeline application.

## Getting Started

```bash
# Install dependencies
pip install -e .
pip install -e ../../packages/python-shared

# Development
npm run dev

# Run pipeline
python src/pipeline/main.py

# Test
npm run test

# Lint
npm run lint

# Format
npm run format
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `PYTHON_ENV`: Environment (development, staging, production)
- `DATA_SOURCE_URL`: Data source URL
- `DATA_OUTPUT_PATH`: Output directory for processed data
- `LOG_LEVEL`: Logging level

## Dependencies

- `repo-python-shared`: Shared Python utilities
- `pandas`: Data processing
- `python-dotenv`: Environment variable management
