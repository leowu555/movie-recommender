# CineRank progress

## Current phase

**Phase 1.** Task **1.2 complete** (dependency locking and repeatable startup). Next: **1.3**.

## Completed

- **0.1–0.3** Repository audit and CineRank docs.
- **1.1** Environment-based configuration.
- **1.2** `requirements.in` + pip-compile lock; unused simplejwt removed from the lock; frontend `npm ci` documented; `docs/DEVELOPMENT.md`.

## What is actually working (do not overclaim)

Unchanged product behavior. Auth is still DRF token auth. Existing `backend/venv` was **not** rewritten; it may still contain old extra packages until you `pip install -r requirements.txt` (or recreate the venv).

## Checks run in 1.2

Ran (throwaway environments; existing `backend/venv` and `frontend/node_modules` not used for clean-install checks):

- `pip-compile` of `requirements.in` with Python 3.13 in a temp venv (pip-tools 7.6.1) — wrote `backend/requirements.txt`.
- Temp venv `pip install -r requirements.txt` — success (macOS ARM wheels).
- `pip check` — no broken requirements.
- `rest_framework_simplejwt` / `jwt` not importable in the temp venv.
- `python manage.py test config movies` in that venv — 20 tests OK.
- `python manage.py check` — no issues.
- Isolated frontend copy: `npm ci` then `npm run build` — build succeeded (Vite 8.0.7). `npm ls` matched the lock (React 19.2.5 via the existing caret range). `npm ci` printed an audit summary (11 vulnerabilities); not addressed in this task.

Did **not** call live TMDB, deploy Lambda, rebuild `lambda.zip`, or modify application data. Did **not** recreate `backend/venv`.

## Blockers

None for marking 1.2 complete on macOS + Python 3.13.

Linux/Lambda wheel reproducibility is **not** verified (documented limitation).

## Exact next task

**1.3 — Add Docker Compose only if it clearly improves local Postgres/app startup.**
