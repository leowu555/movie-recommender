# ADR 0001 — Keep a modular Django app; recommendations as a Python package later

**Status:** accepted  
**Date:** 2026-10-01

## Context

CineRank could be a greenfield services split (API, trainer, vector DB, model server) or an incremental evolution of this repository’s Django + React + PostgreSQL app.

The current recommender is a single authenticated view that rebuilds a dense rating matrix per request. Movie identity is TMDB ids on `Rating` rows, not a catalog table.

## Decision

1. Continue on this codebase. Do not start a parallel application.
2. Keep serving in Django until profiling or dependency isolation requires a separate model process.
3. When baselines and evaluation appear (Phase 3–4), put algorithms in a Python package with `fit` / `score` / `recommend`, runnable without HTTP.
4. Defer Redis, Celery, pgvector, PyTorch, and extra datastores until a named task needs them.

## Consequences

- Phase 1 focuses on config, locks, tests, and CI for **existing** behavior.
- HTTP CF remains the product fallback until an eval-backed model is wired behind the same interface.
- Catalog and MovieLens IDs wait for Phase 2 so ratings keep working with TMDB ids.

## Alternatives rejected

- Immediate microservice / dedicated vector DB / Kafka: no traffic or isolation requirement.
- Replacing user-based CF in place with a neural model: would mix serving changes with unmeasured quality claims.
