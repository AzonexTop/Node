# GitHub Actions CI/CD Workflows

This directory contains GitHub Actions workflows for the monorepo CI/CD pipeline.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **Lint**: Runs format checks and linters for all packages
  - Prettier format check
  - ESLint for TypeScript/JavaScript
  - Flake8, Black, and mypy for Python
- **Type Check**: Runs TypeScript type checking across all packages
- **Test**: Runs unit tests for all packages
  - Uploads coverage reports as artifacts
- **Build**: Builds all applications and packages
  - Uploads build outputs as artifacts
- **All Checks Passed**: Final check ensuring all jobs succeeded

**Required Checks:** All jobs must pass for PRs to be mergeable.

**Caching:**
- Node.js dependencies (npm cache)
- Python dependencies (pip cache)
- Turbo build cache

### 2. PR Validation (`pr-validation.yml`)

**Triggers:**
- Pull request events (opened, edited, synchronize, reopened)

**Jobs:**
- **Validate PR**: 
  - Validates PR title follows Conventional Commits format
  - Checks for merge conflicts
  - Checks for large files (>5MB)
- **PR Size Check**: Warns if PR has >1000 lines changed

**Conventional Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or modifications
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes that don't modify src or test files
- `revert`: Revert previous commits

### 3. Publish Artifacts (`publish.yml`)

**Triggers:**
- Release published
- Push to tags starting with `v*`
- Manual workflow dispatch

**Jobs:**
- **Publish**: 
  - Runs all checks (lint, test)
  - Builds all packages and apps
  - Creates compressed archives for each app
  - Generates checksums
  - Uploads artifacts to GitHub
  - Attaches artifacts to releases
- **Docker Images**: 
  - Builds Docker images for all services
  - Tags with version and `latest`
  - Uploads images as artifacts

**Artifact Retention:** 90 days for releases, 30 days for Docker images

### 4. Cache Warmup (`cache-warmup.yml`)

**Triggers:**
- Scheduled: Every Monday at 00:00 UTC
- Manual workflow dispatch

**Purpose:** Pre-populates caches to speed up subsequent CI runs

**Actions:**
- Installs all dependencies
- Runs builds to populate Turbo cache
- Runs lint and typecheck

### 5. Dependency Review (`dependency-review.yml`)

**Triggers:**
- Pull requests that modify dependency files

**Jobs:**
- **Dependency Review**: 
  - Reviews dependency changes for security issues
  - Fails on moderate+ severity vulnerabilities
  - Posts summary in PR comments
- **Check Outdated**: 
  - Reports outdated npm packages
  - Reports outdated Python packages

## Branch Protection Rules

### Recommended Settings for `main` branch:

1. **Require pull request reviews before merging**
   - Required approving reviews: 1
   - Dismiss stale approvals when new commits are pushed

2. **Require status checks to pass before merging**
   - Required checks:
     - `Lint`
     - `Type Check`
     - `Test`
     - `Build`
     - `All Checks Passed`
     - `Validate PR`

3. **Require conversation resolution before merging**

4. **Require linear history** (optional, for cleaner git history)

5. **Do not allow bypassing the above settings**

### Configuration via GitHub UI:

Navigate to: **Settings → Branches → Add branch protection rule**

Or use the GitHub CLI:

```bash
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks='{"strict":true,"contexts":["Lint","Type Check","Test","Build","All Checks Passed","Validate PR"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  -f restrictions=null
```

## CI Status Badges

Add these badges to your README.md to show CI status:

### Main Branch Status

```markdown
[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
```

### Pull Request Status

```markdown
[![PR Validation](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-validation.yml)
```

### Release Status

```markdown
[![Publish](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/publish.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/publish.yml)
```

## Caching Strategy

### Node.js Dependencies
- **Cache Key**: Hash of `package-lock.json`
- **Location**: `~/.npm`
- **Restoration**: Automatic via `actions/setup-node`

### Python Dependencies
- **Cache Key**: Hash of `requirements*.txt`
- **Location**: `~/.cache/pip`
- **Restoration**: Automatic via `actions/setup-python`

### Turbo Cache
- **Cache Key**: OS + turbo + git SHA
- **Location**: `.turbo` directory
- **Restoration**: Fallback to latest cache on same OS

### Benefits:
- Faster CI runs (3-5x speedup)
- Reduced network traffic
- Cost savings on hosted runners

## Artifacts

### Build Outputs
- **Retention**: 30 days
- **Contents**: 
  - `apps/*/dist/` - Built application files
  - `apps/*/.next/` - Next.js build output
  - `packages/*/dist/` - Built package files

### Coverage Reports
- **Retention**: 30 days
- **Contents**: 
  - `**/coverage/` - Test coverage reports
  - `**/.coverage` - Python coverage data

### Release Artifacts
- **Retention**: 90 days
- **Contents**: 
  - `web-app.tar.gz` - Web application bundle
  - `api-service.tar.gz` - API service bundle
  - `data-pipeline.tar.gz` - Data pipeline bundle
  - `shared-packages.tar.gz` - Shared libraries
  - `checksums.txt` - SHA256 checksums

## Troubleshooting

### Cache Issues

If CI runs are slower than expected or using stale caches:

1. **Clear GitHub Actions cache**:
   ```bash
   gh cache delete --all
   ```

2. **Manually trigger cache warmup**:
   - Go to Actions → Cache Warmup → Run workflow

### Failing Checks

1. **Lint failures**: Run `npm run format` locally, then commit changes
2. **Type errors**: Run `npm run typecheck` locally to debug
3. **Test failures**: Run `npm run test` locally to reproduce
4. **Build failures**: Ensure all dependencies are correctly specified

### PR Validation Failures

1. **PR title format**: Must follow Conventional Commits (e.g., "feat: Add new feature")
2. **Large files**: Use Git LFS for files >5MB
3. **Merge conflicts**: Rebase or merge latest changes from base branch

## Local Development

Run the same checks locally before pushing:

```bash
# Install dependencies
npm install

# Run all checks
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

## Manual Workflow Triggers

Some workflows can be triggered manually:

```bash
# Trigger cache warmup
gh workflow run cache-warmup.yml

# Trigger publish with custom version
gh workflow run publish.yml -f version=v1.2.3
```

## Performance Metrics

Expected CI run times (with warm cache):
- **Lint**: 2-3 minutes
- **Type Check**: 3-4 minutes
- **Test**: 4-5 minutes
- **Build**: 5-6 minutes
- **Total**: ~15 minutes

First run (cold cache): ~20-25 minutes

## Security

- Workflows use pinned action versions (e.g., `@v4`) for stability
- Dependency review automatically checks for vulnerabilities
- No secrets required for standard CI workflows
- Release workflow requires `GITHUB_TOKEN` (automatically provided)

## Future Enhancements

- [ ] Add code coverage reporting to PR comments
- [ ] Integrate Codecov or similar coverage service
- [ ] Add automatic PR labeling based on changed files
- [ ] Add preview deployments for PRs
- [ ] Add E2E testing workflow
- [ ] Add performance benchmarking
- [ ] Add automatic changelog generation
