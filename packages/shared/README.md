# @repo/shared

Shared TypeScript utilities and types used across the monorepo.

## Usage

```typescript
import { formatDate, isValidEmail, type User } from '@repo/shared';

const date = formatDate(new Date());
const isValid = isValidEmail('test@example.com');
```

## Development

```bash
# Build the package
npm run build

# Watch mode
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint
```
