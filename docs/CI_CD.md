# CI/CD Pipeline Documentation

This document provides comprehensive information about the CI/CD pipeline for the monorepo.

## Table of Contents

- [Overview](#overview)
- [Workflows](#workflows)
- [Caching Strategy](#caching-strategy)
- [Artifacts](#artifacts)
- [Branch Protection](#branch-protection)
- [Status Badges](#status-badges)
- [Local Development](#local-development)
- [Troubleshooting](#troubleshooting)

## Overview

The monorepo uses GitHub Actions for continuous integration and deployment with the following key features:

- **Parallel Job Execution**: Lint, typecheck, test, and build run in parallel
- **Smart Caching**: Node.js, Python, and Turbo cache for faster runs
- **Artifact Management**: Build outputs and coverage reports stored as artifacts
- **PR Validation**: Automatic validation of PR titles, merge conflicts, and file sizes
- **Release Automation**: Automated artifact publishing on releases
- **Security Scanning**: Dependency review for security vulnerabilities

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**

#### Lint Job
- Runs Prettier format checks
- Runs ESLint for TypeScript/JavaScript
- Runs Flake8, Black, and mypy for Python
- **Duration**: ~2-3 minutes (with cache)

#### Type Check Job
- Builds packages (required for type checking)
- Runs TypeScript type checking
- **Duration**: ~3-4 minutes (with cache)

#### Test Job
- Builds packages (required for tests)
- Runs Jest for TypeScript/JavaScript
- Runs pytest for Python
- Uploads coverage reports as artifacts
- **Duration**: ~4-5 minutes (with cache)

#### Build Job
- Builds all applications and packages
- Uploads build outputs as artifacts
- **Duration**: ~5-6 minutes (with cache)

#### All Checks Passed Job
- Final check ensuring all jobs succeeded
- Required for PR merging

**Example Run:**
```
Lint          ✅ Passed (2m 34s)
Type Check    ✅ Passed (3m 12s)
Test          ✅ Passed (4m 45s)
Build         ✅ Passed (5m 23s)
All Checks    ✅ Passed (0m 05s)
Total: ~15 minutes
```

### 2. PR Validation Workflow (`pr-validation.yml`)

**Triggers:**
- Pull request opened, edited, synchronized, or reopened

**Jobs:**

#### Validate PR Job
- **PR Title Validation**: Ensures Conventional Commits format
  - Valid: `feat: Add user authentication`
  - Valid: `fix: Resolve API timeout`
  - Valid: `docs: Update README`
  - Invalid: `added new feature` (no type)
  - Invalid: `feat add feature` (no colon)

- **Merge Conflict Check**: Detects conflicts with base branch
- **Large File Check**: Warns about files >5MB

#### PR Size Check Job
- Calculates total lines changed
- Warns if PR has >1000 lines changed
- Suggests breaking into smaller PRs

**Conventional Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `perf`: Performance
- `test`: Testing
- `build`: Build system
- `ci`: CI/CD changes
- `chore`: Maintenance
- `revert`: Revert changes

### 3. Publish Artifacts Workflow (`publish.yml`)

**Triggers:**
- Release published
- Push to tags starting with `v*` (e.g., `v1.0.0`)
- Manual workflow dispatch

**Jobs:**

#### Publish Job
1. Runs all quality checks (lint, test)
2. Builds all packages and apps
3. Creates compressed archives:
   - `web-app.tar.gz` - Next.js application
   - `api-service.tar.gz` - Express API
   - `data-pipeline.tar.gz` - Python pipeline
   - `shared-packages.tar.gz` - Shared libraries
4. Generates SHA256 checksums
5. Uploads artifacts (90-day retention)
6. Attaches artifacts to GitHub release

#### Docker Images Job
1. Builds Docker images for each service
2. Tags with version and `latest`
3. Uses BuildKit caching for efficiency
4. Saves images as artifacts (30-day retention)

**Usage:**
```bash
# Create and publish a release
git tag v1.0.0
git push origin v1.0.0

# Manual trigger with custom version
gh workflow run publish.yml -f version=v1.2.3
```

### 4. Cache Warmup Workflow (`cache-warmup.yml`)

**Triggers:**
- Scheduled: Every Monday at 00:00 UTC
- Manual workflow dispatch

**Purpose:**
Populates caches to ensure fast CI runs throughout the week.

**Actions:**
1. Installs all dependencies
2. Runs builds to populate Turbo cache
3. Runs lint and typecheck
4. Reports cache sizes

### 5. Dependency Review Workflow (`dependency-review.yml`)

**Triggers:**
- Pull requests that modify:
  - `package.json`, `package-lock.json`
  - `requirements.txt`, `requirements-dev.txt`
  - `pyproject.toml` files

**Jobs:**

#### Dependency Review Job
- Scans for security vulnerabilities
- Fails on moderate+ severity issues
- Posts summary in PR comments

#### Check Outdated Job
- Lists outdated npm packages
- Lists outdated Python packages
- Informational only (doesn't fail)

## Caching Strategy

### Node.js Dependencies

**Cache Key:** Hash of `package-lock.json`
**Location:** `~/.npm`
**Managed by:** `actions/setup-node@v4`

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'npm'
```

### Python Dependencies

**Cache Key:** Hash of `requirements*.txt`
**Location:** `~/.cache/pip`
**Managed by:** `actions/setup-python@v5`

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.9'
    cache: 'pip'
```

### Turbo Cache

**Cache Key:** `${{ runner.os }}-turbo-${{ github.sha }}`
**Location:** `.turbo` directory
**Fallback:** Latest cache on same OS

```yaml
- uses: actions/cache@v4
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-turbo-
```

### Cache Performance

| Cache State | Install Time | Build Time | Total |
|-------------|--------------|------------|-------|
| Cold (no cache) | ~5 min | ~8 min | ~13 min |
| Warm (cached) | ~1 min | ~3 min | ~4 min |
| **Speedup** | **5x** | **2.7x** | **3.25x** |

## Artifacts

### Build Outputs

**Retention:** 30 days
**Contents:**
- `apps/*/dist/` - Compiled applications
- `apps/*/.next/` - Next.js build output
- `packages/*/dist/` - Built packages

**Download:**
```bash
gh run download <run-id> -n build-outputs
```

### Coverage Reports

**Retention:** 30 days
**Contents:**
- `**/coverage/` - Coverage HTML/JSON reports
- `**/.coverage` - Python coverage data

**Download:**
```bash
gh run download <run-id> -n coverage-reports
```

### Release Artifacts

**Retention:** 90 days
**Contents:**
- `web-app.tar.gz` - Web application (Next.js)
- `api-service.tar.gz` - API service (Express)
- `data-pipeline.tar.gz` - Data pipeline (Python)
- `shared-packages.tar.gz` - Shared libraries
- `checksums.txt` - SHA256 checksums

**Download from Release:**
```bash
gh release download v1.0.0
```

**Verify checksums:**
```bash
sha256sum -c checksums.txt
```

## Branch Protection

### Recommended Configuration for `main` Branch

#### Via GitHub UI

1. Go to **Settings → Branches**
2. Click **Add branch protection rule**
3. Configure:

**Branch name pattern:** `main`

**Require a pull request before merging:**
- ✅ Require approvals: 1
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (if using CODEOWNERS)

**Require status checks to pass before merging:**
- ✅ Require branches to be up to date before merging
- Required checks:
  - `Lint`
  - `Type Check`
  - `Test`
  - `Build`
  - `All Checks Passed`
  - `Validate PR`

**Require conversation resolution before merging:**
- ✅ Enabled

**Require linear history:** (optional)
- ✅ Enabled (enforces squash/rebase merging)

**Do not allow bypassing the above settings:**
- ✅ Enabled (applies to administrators too)

#### Via GitHub CLI

```bash
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks='{
    "strict": true,
    "contexts": [
      "Lint",
      "Type Check",
      "Test",
      "Build",
      "All Checks Passed",
      "Validate PR"
    ]
  }' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  }' \
  -f restrictions=null
```

#### Via Terraform

```hcl
resource "github_branch_protection" "main" {
  repository_id = github_repository.repo.node_id
  pattern       = "main"

  required_status_checks {
    strict   = true
    contexts = [
      "Lint",
      "Type Check",
      "Test",
      "Build",
      "All Checks Passed",
      "Validate PR"
    ]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews          = true
  }

  enforce_admins              = true
  require_conversation_resolution = true
}
```

## Status Badges

### Add to README.md

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual values:

```markdown
[![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![PR Validation](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-validation.yml)
[![Publish](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/publish.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/publish.yml)
```

### Individual Status Badges

**Main Branch CI:**
```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg?branch=main)
```

**Develop Branch CI:**
```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg?branch=develop)
```

**Specific Workflow:**
```markdown
![PR Validation](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-validation.yml/badge.svg)
```

**With Custom Label:**
```markdown
[![Build Status](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
```

## Local Development

### Run All Checks Locally

Before pushing, run the same checks that CI will run:

```bash
# Install dependencies
npm install
pip install -r requirements-dev.txt

# Format code
npm run format

# Run all checks
npm run format:check  # Prettier format check
npm run lint         # ESLint + Flake8 + Black + mypy
npm run typecheck    # TypeScript type checking
npm run test         # Jest + pytest
npm run build        # Build all packages/apps
```

### Run Checks for Specific Package

```bash
# TypeScript package
cd packages/shared
npm run lint
npm run typecheck
npm run build

# Python package
cd packages/python-shared
npm run lint  # Runs flake8 + black + mypy
npm run test  # Runs pytest
```

### Git Hooks

The repository uses Husky for git hooks. Run checks automatically before commit:

```bash
# Install hooks
npm install  # Runs 'npm run prepare' which installs Husky
```

**Pre-commit hook** (add to `.husky/pre-commit`):
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run format:check
npm run lint
```

**Pre-push hook** (add to `.husky/pre-push`):
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run typecheck
npm run test
```

## Troubleshooting

### Cache Issues

**Problem:** CI runs are slow or using stale caches

**Solutions:**

1. **Clear all caches:**
   ```bash
   gh cache delete --all
   ```

2. **Clear specific cache:**
   ```bash
   gh cache list
   gh cache delete <cache-id>
   ```

3. **Trigger cache warmup:**
   ```bash
   gh workflow run cache-warmup.yml
   ```

### Failing Lint Checks

**Problem:** Lint job fails in CI but passes locally

**Solutions:**

1. **Ensure dependencies are up to date:**
   ```bash
   npm install
   npm run lint
   ```

2. **Run Prettier to format code:**
   ```bash
   npm run format
   git add .
   git commit -m "chore: Format code"
   ```

3. **Check for Python linting issues:**
   ```bash
   pip install -r requirements-dev.txt
   cd apps/data-pipeline
   flake8 src/
   black --check src/
   mypy src/
   ```

### Failing Type Checks

**Problem:** TypeScript type errors in CI

**Solutions:**

1. **Build packages first:**
   ```bash
   npm run build
   npm run typecheck
   ```

2. **Check for missing type definitions:**
   ```bash
   npm install --save-dev @types/node @types/react
   ```

3. **Verify tsconfig.json is correct:**
   ```bash
   cat tsconfig.json
   ```

### Failing Tests

**Problem:** Tests pass locally but fail in CI

**Solutions:**

1. **Check for environment differences:**
   - Node.js version
   - Python version
   - Missing environment variables

2. **Run tests in clean environment:**
   ```bash
   npm run clean
   npm install
   npm run build
   npm run test
   ```

3. **Check for timezone or locale issues:**
   ```bash
   TZ=UTC npm run test
   ```

### Build Failures

**Problem:** Build fails in CI but works locally

**Solutions:**

1. **Clean build artifacts:**
   ```bash
   npm run clean
   npm install
   npm run build
   ```

2. **Check for missing dependencies:**
   ```bash
   npm install --save <missing-package>
   ```

3. **Verify package.json scripts:**
   ```bash
   cat package.json | grep scripts -A 10
   ```

### PR Validation Failures

**Problem:** PR title validation fails

**Solution:** Update PR title to follow Conventional Commits:
```
✅ feat: Add user authentication
✅ fix: Resolve API timeout issue
✅ docs: Update README
❌ added new feature
❌ Fix bug
```

**Problem:** Large file detection fails

**Solution:** Use Git LFS for large files:
```bash
git lfs track "*.zip"
git lfs track "*.tar.gz"
git add .gitattributes
git commit -m "chore: Add Git LFS tracking"
```

**Problem:** Merge conflict detection fails

**Solution:** Rebase on base branch:
```bash
git fetch origin
git rebase origin/main
# Resolve conflicts
git push --force-with-lease
```

### Artifact Upload Failures

**Problem:** Artifacts fail to upload

**Solutions:**

1. **Check artifact size** (max 10GB per artifact)
2. **Verify paths exist:**
   ```bash
   ls -la apps/*/dist/
   ls -la packages/*/dist/
   ```

3. **Check permissions:**
   ```bash
   chmod -R 755 apps/*/dist/
   ```

## Best Practices

### 1. Keep PRs Small
- Aim for <500 lines changed
- Break large changes into multiple PRs
- Each PR should have a single purpose

### 2. Write Good PR Titles
```
✅ feat: Add user authentication with JWT
✅ fix: Resolve memory leak in API service
✅ docs: Update installation instructions
❌ updates
❌ various fixes
```

### 3. Run Checks Before Pushing
```bash
npm run format
npm run lint
npm run typecheck
npm run test
npm run build
```

### 4. Monitor CI Performance
- Check workflow run times
- Look for slow jobs
- Optimize tests if needed

### 5. Keep Dependencies Updated
- Review dependency PRs promptly
- Run `npm outdated` regularly
- Use Dependabot for automation

### 6. Use Draft PRs
- Create draft PRs for work in progress
- Convert to ready when CI passes
- Prevents premature reviews

### 7. Review CI Logs
- Check logs for warnings
- Look for deprecation notices
- Monitor resource usage

## CI/CD Metrics

### Target Performance

| Metric | Target | Current |
|--------|--------|---------|
| CI Run Time (warm cache) | <15 min | ~15 min |
| CI Run Time (cold cache) | <25 min | ~20 min |
| Cache Hit Rate | >80% | ~85% |
| Test Pass Rate | >95% | TBD |
| Deploy Success Rate | >99% | TBD |

### Monitoring

Track CI/CD metrics in GitHub Actions:
- Go to **Actions** tab
- Click on workflow name
- View run history and timing

## Security Considerations

### Secrets Management
- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly

### Dependency Scanning
- Dependency review workflow checks for vulnerabilities
- Fails on moderate+ severity issues
- Review and update vulnerable dependencies promptly

### Permissions
- Workflows use minimal required permissions
- `GITHUB_TOKEN` auto-generated per run
- No long-lived credentials

### Branch Protection
- Enforce required reviews
- Require CI checks to pass
- No force pushing to protected branches

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Turborepo CI/CD Guide](https://turbo.build/repo/docs/ci)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
