# GitHub Actions Workflows Summary

This document provides a quick reference for all GitHub Actions workflows in this repository.

## Quick Reference Table

| Workflow | File | Trigger | Duration | Purpose |
|----------|------|---------|----------|---------|
| **CI** | `ci.yml` | Push/PR to main/develop | ~15 min | Runs lint, tests, type checks, and builds |
| **PR Validation** | `pr-validation.yml` | PR events | ~5 min | Validates PR title, checks conflicts, file sizes |
| **Publish Artifacts** | `publish.yml` | Release/tags | ~20 min | Builds and publishes release artifacts |
| **Cache Warmup** | `cache-warmup.yml` | Weekly schedule/manual | ~20 min | Warms up caches for faster CI runs |
| **Dependency Review** | `dependency-review.yml` | PR with dep changes | ~10 min | Reviews dependency changes for security |

## Workflow Details

### 1. CI Workflow ⚡

**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**
- ✅ **Lint** - Format checks (Prettier, ESLint, Flake8, Black, mypy)
- ✅ **Type Check** - TypeScript type checking
- ✅ **Test** - Unit tests (Jest, pytest) with coverage upload
- ✅ **Build** - Build all apps/packages with artifact upload
- ✅ **All Checks Passed** - Final validation gate

**Artifacts:**
- Build outputs (30 days)
- Coverage reports (30 days)

**Cache:**
- Node.js dependencies
- Python dependencies
- Turbo build cache

**Required for:** PR merging

---

### 2. PR Validation Workflow 🔍

**File:** `.github/workflows/pr-validation.yml`

**Triggers:**
- PR opened, edited, synchronized, reopened

**Jobs:**
- ✅ **Validate PR** - Conventional Commits, merge conflicts, large files
- ✅ **PR Size Check** - Warns on >1000 lines changed

**Conventional Commit Types:**
`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Required for:** PR merging

---

### 3. Publish Artifacts Workflow 📦

**File:** `.github/workflows/publish.yml`

**Triggers:**
- Release published
- Tags pushed (v*)
- Manual workflow dispatch

**Jobs:**
- ✅ **Publish** - Build and package all apps
- ✅ **Docker Images** - Build Docker images for all services

**Artifacts:** (90 days)
- `web-app.tar.gz`
- `api-service.tar.gz`
- `data-pipeline.tar.gz`
- `shared-packages.tar.gz`
- `checksums.txt`
- Docker images (30 days)

**Manual Trigger:**
```bash
gh workflow run publish.yml -f version=v1.2.3
```

---

### 4. Cache Warmup Workflow ♻️

**File:** `.github/workflows/cache-warmup.yml`

**Triggers:**
- Scheduled: Every Monday at 00:00 UTC
- Manual workflow dispatch

**Purpose:**
Pre-populates all caches (npm, pip, Turbo) for faster CI runs during the week

**Actions:**
- Installs all dependencies
- Runs builds to populate Turbo cache
- Reports cache sizes

**Manual Trigger:**
```bash
gh workflow run cache-warmup.yml
```

---

### 5. Dependency Review Workflow 🔒

**File:** `.github/workflows/dependency-review.yml`

**Triggers:**
- PR modifying dependency files:
  - `package.json`, `package-lock.json`
  - `requirements.txt`, `requirements-dev.txt`
  - `pyproject.toml`

**Jobs:**
- ✅ **Dependency Review** - Security scanning (fails on moderate+ severity)
- ✅ **Check Outdated** - Lists outdated packages (informational)

**Permissions:**
- `contents: read`
- `pull-requests: write`

---

## Branch Protection Requirements

For `main` branch, require these checks to pass:
- ✅ Lint
- ✅ Type Check
- ✅ Test
- ✅ Build
- ✅ All Checks Passed
- ✅ Validate PR

Configure in: **Settings → Branches → Branch protection rules**

---

## Status Badges

Add to README.md:

```markdown
[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![PR Validation](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-validation.yml)
[![Publish](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/publish.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/publish.yml)
```

---

## Caching Strategy

| Cache Type | Location | Key | Managed By |
|------------|----------|-----|------------|
| npm | `~/.npm` | `package-lock.json` hash | `actions/setup-node` |
| pip | `~/.cache/pip` | `requirements*.txt` hash | `actions/setup-python` |
| Turbo | `.turbo` | OS + git SHA | `actions/cache` |

**Performance:**
- Cold cache: ~20-25 min
- Warm cache: ~15 min
- Speedup: **3-4x**

---

## Artifact Retention

| Artifact Type | Retention | Size Limit |
|---------------|-----------|------------|
| Build outputs | 30 days | 10 GB per artifact |
| Coverage reports | 30 days | 10 GB per artifact |
| Release artifacts | 90 days | 2 GB per file |
| Docker images | 30 days | 10 GB per artifact |

---

## Manual Workflow Triggers

```bash
# Cache warmup
gh workflow run cache-warmup.yml

# Publish with custom version
gh workflow run publish.yml -f version=v1.2.3

# List workflows
gh workflow list

# View workflow runs
gh run list --workflow=ci.yml

# Download artifacts
gh run download <run-id> -n build-outputs
```

---

## Workflow Monitoring

### View in GitHub UI
1. Go to **Actions** tab
2. Click on workflow name
3. View runs, logs, and artifacts

### View with GitHub CLI
```bash
# List recent runs
gh run list --limit 10

# View specific run
gh run view <run-id>

# View logs
gh run view <run-id> --log

# Download artifacts
gh run download <run-id>
```

---

## Troubleshooting

### Common Issues

**Workflow fails on first run:**
- Expected due to cold cache
- Re-run usually succeeds faster

**Lint failures:**
```bash
npm run format
git add .
git commit -m "chore: Format code"
```

**Type check failures:**
```bash
npm run build
npm run typecheck
```

**Test failures:**
```bash
npm run test -- --verbose
```

**Cache issues:**
```bash
# Clear all caches
gh cache delete --all

# Trigger cache warmup
gh workflow run cache-warmup.yml
```

---

## Performance Metrics

### Target Times (with warm cache)

| Job | Target | Typical |
|-----|--------|---------|
| Lint | 2-3 min | 2m 30s |
| Type Check | 3-4 min | 3m 15s |
| Test | 4-5 min | 4m 45s |
| Build | 5-6 min | 5m 20s |
| **Total** | **~15 min** | **~15 min** |

### First Run (cold cache)
- Expected: 20-25 minutes
- Subsequent runs: 15 minutes
- Speedup: **~40% faster**

---

## Security

### Permissions
All workflows use minimal required permissions:
- `contents: read` - Default for most jobs
- `contents: write` - Only for publish workflow
- `pull-requests: write` - Only for dependency review

### Secrets
- No custom secrets required
- `GITHUB_TOKEN` auto-provided
- Expires after workflow completes

### Dependencies
- Actions pinned to major versions (@v4)
- Dependabot monitors for updates
- Security scanning on dependency changes

---

## Related Documentation

- [Detailed CI/CD Guide](../docs/CI_CD.md)
- [Workflow README](.github/workflows/README.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## Quick Start

### For Contributors

1. **Before pushing:**
   ```bash
   npm run format
   npm run lint
   npm run typecheck
   npm run test
   npm run build
   ```

2. **Create PR with valid title:**
   ```
   feat: Add new feature
   fix: Resolve bug
   docs: Update docs
   ```

3. **Wait for CI checks:**
   - All checks must pass
   - Review any failures
   - Fix and push again

### For Maintainers

1. **Configure branch protection:**
   - Settings → Branches
   - Add rule for `main`
   - Require status checks

2. **Monitor CI performance:**
   - Actions → Workflows
   - Check run times
   - Review cache hit rates

3. **Manage releases:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   # Publish workflow runs automatically
   ```

---

## Updates

This document is automatically generated. Last updated: 2024

For the latest information, see:
- [Workflow Files](.github/workflows/)
- [CI/CD Documentation](../docs/CI_CD.md)
