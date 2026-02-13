# Contributing to PlanIT.IO

Thank you for your interest in contributing to PlanIT.IO! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the repository** and clone your fork locally.
2. **Install dependencies**: `pnpm install`
3. **Create a branch** from `develop`:
   ```bash
   git checkout develop
   git checkout -b feature/FR-XX-your-feature-name
   ```
4. **Make your changes** following our coding standards.
5. **Test your changes**: `pnpm test`
6. **Lint your code**: `pnpm lint`
7. **Commit using Conventional Commits** (see below).
8. **Push to your fork** and submit a **Pull Request** to `develop`.

## Branching Strategy

| Branch | Purpose | Naming |
|---|---|---|
| `main` | Production-ready releases | — |
| `develop` | Integration branch | — |
| `feature/*` | New features | `feature/FR-XX-description` |
| `bugfix/*` | Bug fixes | `bugfix/BUG-XX-description` |
| `hotfix/*` | Critical production fixes | `hotfix/HOT-XX-description` |
| `release/*` | Release preparation | `release/X.Y.Z` |

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must follow this format:

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code formatting (no logic change) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding/updating tests |
| `build` | Build system or dependencies |
| `ci` | CI/CD configuration |
| `chore` | Maintenance tasks |
| `security` | Security-related changes |

### Scopes

Use the package/service name: `desktop`, `gateway`, `auth`, `users`, `projects`, `tasks`, `notifications`, `shared-types`, `shared-utils`, `ui-components`, `validation`, `prisma`, `docker`, `ci`, `docs`, `deps`.

### Examples

```
feat(tasks): add drag-and-drop reordering to kanban board
fix(auth): prevent token refresh race condition
docs(desktop): update installation instructions for macOS
security(gateway): add rate limiting to auth endpoints
```

## Pull Request Process

1. Update documentation for any changed behavior.
2. Ensure all CI checks pass (lint, test, build).
3. Request at least **1 code review** approval.
4. Link the related issue or ticket in the PR description.
5. Use a descriptive PR title following Conventional Commits.
6. Squash commits when merging to keep history clean.

## Development Standards

- **TypeScript** for all source code (strict mode enabled).
- **ESLint + Prettier** — run `pnpm lint:fix && pnpm format` before committing.
- **Tests** — all new features must include tests; bug fixes should include a regression test.
- **Type safety** — avoid `any`; use proper TypeScript types and Zod schemas for validation.
- **Imports** — use `type` imports for type-only imports.

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml) and include:
- Steps to reproduce
- Expected vs actual behavior
- OS (Windows/macOS/Linux) and version
- Screenshots or logs if applicable

## Feature Requests

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml) and include:
- Problem description
- Proposed solution
- Alternatives considered

## Questions?

Open a [Discussion](../../discussions) for questions or ideas that aren't bugs or feature requests.

---

Thank you for contributing! 🚀
