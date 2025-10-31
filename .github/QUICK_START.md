# CI/CD Quick Start Guide

Get up and running with the CI/CD pipeline in 5 minutes.

## 🚀 For Contributors

### 1. Before Creating a PR

Run these checks locally to ensure CI will pass:

```bash
# Install dependencies
npm install
pip install -r requirements-dev.txt

# Format code
npm run format

# Run all checks (these will run in CI)
npm run format:check  # Prettier
npm run lint         # ESLint + Flake8 + Black + mypy
npm run typecheck    # TypeScript
npm run test         # Jest + pytest
npm run build        # Build all packages
```

### 2. Create Your Branch

Use descriptive branch names:

```bash
git checkout -b feat/add-user-auth
git checkout -b fix/resolve-timeout
git checkout -b docs/update-readme
```

### 3. Write Your PR Title

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

✅ **Good:**
- `feat: Add user authentication with JWT`
- `fix: Resolve API timeout in data pipeline`
- `docs: Update installation instructions`
- `refactor: Simplify error handling logic`

❌ **Bad:**
- `updated code`
- `fixes`
- `WIP`

**Format:** `<type>: <description>`

**Valid types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `perf` - Performance
- `test` - Tests
- `build` - Build system
- `ci` - CI/CD
- `chore` - Maintenance

### 4. Push and Create PR

```bash
git add .
git commit -m "feat: Add user authentication"
git push origin feat/add-user-auth
```

Then create a PR on GitHub with the same title format.

### 5. Wait for CI Checks

CI will automatically run these checks:

| Check | What it does | Duration |
|-------|--------------|----------|
| ✅ Lint | Code formatting and style | ~2-3 min |
| ✅ Type Check | TypeScript type safety | ~3-4 min |
| ✅ Test | Unit tests | ~4-5 min |
| ✅ Build | Build verification | ~5-6 min |
| ✅ Validate PR | Title format, conflicts | ~1 min |

**Total time:** ~15 minutes (first run ~20-25 min)

### 6. Fix Any Failures

If CI fails:

**Lint failures:**
```bash
npm run format
git add .
git commit -m "chore: Format code"
git push
```

**Type errors:**
```bash
npm run typecheck
# Fix errors
git add .
git commit -m "fix: Resolve type errors"
git push
```

**Test failures:**
```bash
npm run test -- --verbose
# Fix tests
git add .
git commit -m "test: Fix failing tests"
git push
```

### 7. Get Approval and Merge

- Wait for reviewer approval
- All CI checks must pass
- Resolve any review comments
- Merge when ready! 🎉

---

## 🔧 For Maintainers

### Initial Setup

1. **Configure Branch Protection:**

   Go to **Settings → Branches → Add rule**

   - Branch name pattern: `main`
   - ✅ Require pull request reviews (1 approval)
   - ✅ Require status checks to pass
   - Required checks:
     - `Lint`
     - `Type Check`
     - `Test`
     - `Build`
     - `All Checks Passed`
     - `Validate PR`
   - ✅ Require conversation resolution

2. **Update Badge URLs in README:**

   Replace `YOUR_USERNAME` and `YOUR_REPO` in:
   - `README.md`
   - `.github/workflows/README.md`

3. **Configure Dependabot (Optional):**

   Update `.github/dependabot.yml`:
   - Replace `YOUR_GITHUB_USERNAME` with your username

4. **Enable GitHub Actions:**

   Ensure Actions are enabled:
   - Settings → Actions → General
   - ✅ Allow all actions and reusable workflows

### Creating Releases

1. **Tag a version:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create GitHub release:**
   - Go to Releases → Draft a new release
   - Choose tag: `v1.0.0`
   - Write release notes
   - Publish release

3. **Artifacts are automatically published:**
   - `web-app.tar.gz`
   - `api-service.tar.gz`
   - `data-pipeline.tar.gz`
   - `shared-packages.tar.gz`
   - Docker images

### Monitoring CI/CD

**View workflow runs:**
```bash
gh run list --limit 10
```

**View specific run:**
```bash
gh run view <run-id> --log
```

**Download artifacts:**
```bash
gh run download <run-id> -n build-outputs
```

**Clear caches:**
```bash
gh cache delete --all
```

**Trigger cache warmup:**
```bash
gh workflow run cache-warmup.yml
```

---

## ⚡ Performance Tips

### For Faster CI Runs

1. **Keep dependencies up to date** - Reduces install time
2. **Don't commit node_modules** - Slows down checkout
3. **Use .gitignore properly** - Faster git operations
4. **Keep PRs small** - Faster to build and test
5. **Run checks locally first** - Avoid failed CI runs

### Cache Hit Optimization

- First run: ~20-25 min (cold cache)
- Subsequent runs: ~15 min (warm cache)
- Weekly cache warmup: Keeps caches fresh

### When to Clear Caches

- Dependency installation issues
- Unusual build failures
- After major dependency updates

```bash
gh cache delete --all
```

---

## 🐛 Common Issues

### PR Title Validation Fails

**Error:** "PR title doesn't match pattern"

**Fix:** Update PR title to use Conventional Commits format:
```
feat: Add new feature
```

### Merge Conflict Detected

**Error:** "Merge conflicts detected"

**Fix:** Rebase on base branch:
```bash
git fetch origin
git rebase origin/main
# Resolve conflicts
git rebase --continue
git push --force-with-lease
```

### Large File Warning

**Error:** "Large files detected (>5MB)"

**Fix:** Use Git LFS:
```bash
git lfs track "*.zip"
git add .gitattributes
git commit -m "chore: Add Git LFS tracking"
```

### CI Runs Too Slow

**Fix 1:** Trigger cache warmup:
```bash
gh workflow run cache-warmup.yml
```

**Fix 2:** Check if dependencies are cached:
- View workflow logs
- Look for "Cache restored" messages

### Test Failures Only in CI

**Common causes:**
- Environment differences (Node/Python version)
- Missing environment variables
- Timezone/locale issues

**Debug:**
```bash
# Check versions
node --version
python --version

# Run with CI environment
NODE_ENV=test npm run test
```

---

## 📚 Additional Resources

- [Detailed CI/CD Documentation](../docs/CI_CD.md)
- [Workflows README](.github/workflows/README.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Workflows Summary](WORKFLOWS_SUMMARY.md)

---

## 💡 Pro Tips

1. **Use Draft PRs** for work in progress
2. **Run checks before pushing** to save time
3. **Small, focused PRs** are easier to review
4. **Good PR descriptions** help reviewers
5. **Respond to feedback promptly**
6. **Squash commits** for cleaner history
7. **Monitor CI logs** for warnings
8. **Keep your branch updated** with main

---

## ✅ Checklist for First-Time Contributors

Before your first PR:

- [ ] Fork and clone the repository
- [ ] Install dependencies (`npm install`)
- [ ] Run tests locally (`npm run test`)
- [ ] Read CONTRIBUTING.md
- [ ] Understand Conventional Commits
- [ ] Create a descriptive branch name
- [ ] Write a good PR description
- [ ] Run all checks before pushing
- [ ] Be patient with CI (first run is slow)
- [ ] Respond to review feedback

---

## 🎯 Success Criteria

Your PR is ready to merge when:

- ✅ All CI checks pass (Lint, Type Check, Test, Build)
- ✅ PR title follows Conventional Commits
- ✅ At least 1 approving review
- ✅ All conversations resolved
- ✅ No merge conflicts
- ✅ Documentation updated (if needed)

---

## 🤝 Getting Help

**CI/CD Issues:**
- Check [Troubleshooting](../docs/CI_CD.md#troubleshooting)
- Review workflow logs
- Ask in PR comments

**Code Issues:**
- Review [Contributing Guide](../CONTRIBUTING.md)
- Check existing issues
- Open a new issue if needed

---

**Happy Contributing! 🚀**
