# @repo/ui

Shared React components library.

## Usage

```typescript
import { Button, Card } from '@repo/ui';

function App() {
  return (
    <Card title="Welcome">
      <Button variant="primary" onClick={() => console.log('clicked')}>
        Click me
      </Button>
    </Card>
  );
}
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
