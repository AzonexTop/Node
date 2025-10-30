# @repo/eslint-config

Shared ESLint configurations for the monorepo.

## Usage

In your package's `.eslintrc.js`:

### For Next.js apps:
```js
module.exports = {
  extends: ['@repo/eslint-config/nextjs'],
};
```

### For Node.js services:
```js
module.exports = {
  extends: ['@repo/eslint-config/node'],
};
```

### For React libraries:
```js
module.exports = {
  extends: ['@repo/eslint-config/react'],
};
```
