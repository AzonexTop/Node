# @repo/python-shared

Shared Python utilities and models for the monorepo.

## Installation

```bash
pip install -e .
```

## Usage

```python
from repo_shared import format_timestamp, BaseModel
from datetime import datetime

timestamp = format_timestamp(datetime.now())

class User(BaseModel):
    name: str
    email: str
```

## Development

```bash
# Install in development mode
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black src/

# Lint
flake8 src/
mypy src/
```
