# CineRank progress

## Current phase

**Phase 0 complete.** Next implementation work is **Phase 1**.

## Completed

- **0.1** Repository audit against `main` @ `e24af01`.
- **0.2** Added `docs/PROJECT_SPEC.md`, this file, `docs/ROADMAP.md`, `docs/decisions/0001-keep-django-monolith.md`.
- **0.3** Selected **1.1** as the smallest next task.

## What is actually working (do not overclaim)

- TMDB search and details via Django (slash and no-slash routes).
- DRF token auth; ratings stored in PostgreSQL, scoped to `request.user`.
- In-request user-based cosine CF with sparse-data fallbacks.
- React UI for search, details, auth, profile, For You, localStorage watchlist.
- Lambda Function URL packaging for the Django ASGI movie API (historical deploy; not re-verified in Phase 0).
- Movie API tests with mocked TMDB.

## Checks run in Phase 0

- Read models, URLs, views, settings, requirements, gitignore, README, frontend API/auth/watchlist, and test files.
- `git status` / `git log` / remote inspection.
- **Did not** run Django tests, migrate, or hit TMDB/Lambda (Phase 0 is documentation-only).

## Blockers

None for starting 1.1.

Local full-stack still requires Python venv, Node, PostgreSQL 16, and a TMDB key as documented in the README.

## Exact next task

**1.1 — Document and validate configuration; ensure secrets and generated files are ignored.**

Move or document `SECRET_KEY` / `DEBUG` handling, confirm `.env.example` and gitignore coverage, keep the app startable. No Redis, no new recommendation models.
