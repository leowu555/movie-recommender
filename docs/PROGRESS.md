# CineRank progress

## Current phase

**Phase 1.** Task **1.2** is ready to commit after the 1.2 review corrections. Next implementation task remains **1.3** (skip **1.6** until you choose to do audit remediation).

## Completed

- **0.1–0.3** Repository audit and CineRank docs.
- **1.1** Environment-based configuration.
- **1.2** pip-compile lock + documented startup (corrected: `pip install -r` does not remove extras; Python 3.12 unverified; compile script pins pip-tools).

## What is actually working (do not overclaim)

Unchanged product behavior. Auth is still DRF token auth. Existing `backend/venv` was **not** rewritten and was **not** synchronized.

## Checks run in 1.2 (original)

Throwaway environments (not `backend/venv` / not `frontend/node_modules`):

- pip-compile with Python **3.13.12**, pip-tools **7.6.1**.
- Temp venv `pip install -r requirements.txt`, `pip check`, config+movies tests (20 OK), `manage.py check`.
- Isolated `npm ci` + `npm run build` on Node **24.14.0**, npm **11.9.0**.

## Checks run in the 1.2 review

- Compared regenerated `requirements.txt` to the previously tracked freeze: **no remaining package version increases.** Removed from the lock: `djangorestframework-simplejwt==5.5.1`, `PyJWT==2.13.0`. `typing_extensions` renamed to `typing-extensions` (same 4.15.0). Direct pins in `requirements.in` match the old freeze.
- Documentation and `compile-requirements.sh` edits only. **Did not** re-run the full test suite, **did not** run `pip-sync`, **did not** capture a new `npm audit --json` in this review session (shell execution was unavailable). Audit notes reuse the 1.2 `npm ci` summary plus public Vite 8.0.7 advisory information.

## Blockers

None for committing 1.2 docs+lock. Python 3.12 and Linux/Lambda remain unverified. npm audit package-by-package JSON is deferred to **1.6**.

## Exact next task

**1.3 — Add Docker Compose only if it clearly improves local Postgres/app startup.**
