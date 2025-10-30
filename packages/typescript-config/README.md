# @repo/typescript-config

Shared TypeScript configurations for the monorepo.

## Usage

In your package's `tsconfig.json`:

### For Next.js apps:
```json
{
  "extends": "@repo/typescript-config/nextjs.json"
}
```

### For Node.js services:
```json
{
  "extends": "@repo/typescript-config/node.json"
}
```

### For React libraries:
```json
{
  "extends": "@repo/typescript-config/react.json"
}
```
