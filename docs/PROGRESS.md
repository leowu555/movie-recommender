# CineRank progress

## Current phase

**Phase 1.** Task **1.1 complete** (environment-based configuration). Next: **1.2**.

## Completed

- **0.1–0.3** Repository audit and CineRank docs.
- **1.1** Environment-based `SECRET_KEY` / `DEBUG` / hosts / CORS; `.env.example` and gitignore updates; parser tests; configuration docs.

## What is actually working (do not overclaim)

- TMDB search and details via Django (slash and no-slash routes).
- DRF token auth; ratings stored in PostgreSQL, scoped to `request.user`.
- In-request user-based cosine CF with sparse-data fallbacks.
- React UI for search, details, auth, profile, For You, localStorage watchlist.
- Lambda Function URL packaging for the Django ASGI movie API (historical deploy). After 1.1, Lambda **must** set `SECRET_KEY` and `ALLOWED_HOSTS` (and typically `DEBUG=false`, `TMDB_API_KEY`) in the function environment; that update was not deployed in this task.
- Movie API tests with mocked TMDB; configuration parser tests.

## Checks run in 1.1

Ran (backend venv, temporary non-secret `SECRET_KEY` in the process environment; no `.env` file present in this workspace):

- `python manage.py test config movies` — 20 tests OK (Postgres test database created and destroyed).
- `python manage.py check` — no issues.
- `from config.lambda_handler import handler` — imported `Mangum` (no deploy, no Function URL call).
- Direct parser calls for missing/blank `SECRET_KEY` and invalid `DEBUG` — `ImproperlyConfigured`.

Did **not** call live TMDB, upload Lambda, or modify application data. Did **not** read or write a local `.env`.

Inspection: `backend/.env.example` is tracked; `.env` paths are gitignored; `settings.py` no longer contains a hardcoded secret or Lambda hostname. The previous `SECRET_KEY` value remains in git history.

## Blockers

Local run and Django tests that load settings require a nonempty `SECRET_KEY` in `backend/.env` or the process environment. Existing local `.env` files were not modified.

Lambda will fail to boot until its environment includes `SECRET_KEY` and an `ALLOWED_HOSTS` value that includes the Function URL hostname.

The old development `SECRET_KEY` remains in git history from earlier commits; rotate keys for any shared remote.

## Exact next task

**1.2 — Establish dependency locking and repeatable local startup.**
