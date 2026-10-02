# CineRank — Project Specification

CineRank is the long-term name for evolving this repository (`movie-recommender`) into a technically rigorous movie discovery and recommendation platform. This document describes the **current** codebase as inspected, the intended architecture, and what is implemented versus planned.

Repository inspected: branch `main` at `e24af01` (`Fixed frontend design`), remote `origin` = `https://github.com/leowu555/movie-recommender.git`.

## Objective

Build a full-stack movie discovery platform with reliable accounts, ratings, watchlists, and discovery; reproducible recommendation experiments; content-based and collaborative baselines; semantic search; hybrid two-tower retrieval; learning-to-rank; diversity-aware reranking; versioned model deployment; and an optional sequential-recommendation research extension.

**Research question:** How much do content-aware retrieval and recent interaction history improve sparse-history recommendations, and what relevance, diversity, latency, and cost trade-offs result?

Do not assume complex models outperform simple models. Measure the difference. Do not treat demo seed ratings as evaluation evidence.

## Boundaries

- Evolve the existing Django + React app; do not rewrite from scratch.
- Keep recommendation algorithms in a Python package with fit/score/recommend interfaces; training and evaluation must run without an HTTP server.
- Training happens outside request handling.
- Do not add Kafka, Kubernetes, a dedicated feature store, another vector database, or a separate model-serving service until a documented requirement or profiling justifies it.
- Preserve working search, auth, ratings, and recommendation APIs unless a task documents a deliberate migration.
- Do not present Lambda Function URL, seed users, or UI polish as production scale or offline metric gains.

## Current architecture (as implemented)

```text
React (Vite, JS)  --REST-->  Django + DRF
                                |           |
                         PostgreSQL      TMDB HTTP API
                         (users, tokens, (live catalog)
                          ratings)

Optional: same Django ASGI app via Mangum on AWS Lambda Function URL
(movie search/details only in practice; no Postgres-backed personalization in that path)
```

There is no Redis, Celery, Docker Compose, CI, pgvector, MLflow, or offline evaluation pipeline.

### Backend apps

| App | Reality |
|-----|---------|
| `movies` | TMDB proxy: search + details. **No `Movie` model.** IDs are TMDB integers. |
| `accounts` | Register/login/logout/me using Django `User` + DRF `TokenAuthentication`. |
| `ratings` | `Rating(user, movie_id, title, poster_url, score)` with `unique_together` on `(user, movie_id)`. Score 1–5 enforced in serializer, not a DB check. |
| `recommendations` | In-request user-based CF in `recommendations/views.py`. Empty models. |
| `watchlist` | Django app scaffold only. **Not wired in `config/urls.py`.** UI uses `localStorage`. |

### Identity and data

- Application users: Django `auth.User`.
- Movie identity: **TMDB `id` stored as `ratings.Rating.movie_id`**. No MovieLens mapping. No canonical catalog table.
- Ratings cache `title` and `poster_url` on the rating row (denormalized display fields).
- Watchlist items: browser-only (`frontend/src/utils/storage.js`), not per-account, not isolated across devices.

### Recommendation implementation

`GET /api/recommendations/` (authenticated):

1. Load **all** ratings into a dense NumPy user–item matrix (unrated cells = 0).
2. `sklearn.metrics.pairwise.cosine_similarity` across users.
3. Top-5 neighbors; recommend movies they scored ≥ 4 that the current user has not rated; rank by `similarity * neighbor_score`.
4. Fallbacks: empty ratings; single-user matrix → user’s own top ratings; no CF hits → other users’ movies (`fallback_popular`).

Limitations: rebuilt on every request; zeros treated as ratings of 0 for cosine; catalog is only already-rated movies, not TMDB; no train/serve split; no offline metrics.

### Frontend

React 19 + Vite 8 + React Router 7 (JavaScript). Pages: Home (search), Movie details, Watchlist, Login, Register, Profile, Recommendations (“For You”), 404. Auth token in `localStorage`. Default API base: `http://127.0.0.1:8000`; optional `VITE_API_BASE_URL` for Lambda.

### Deployment

- Local: Django `runserver` + Postgres 16 + Vite.
- AWS: function `movie-recommender-api`, handler `config.lambda_handler.handler`, Function URL host listed in `ALLOWED_HOSTS`. Packaging via zip + Mangum (`lifespan="off"`). **Not API Gateway. Frontend not on S3.**
- Lambda path is suitable for TMDB proxy; auth/ratings/recs require the local Postgres-backed process unless a later phase deploys that stack.

### Configuration and security debt

- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, and CORS origins are read from the environment (`config/environ.py`). See `docs/CONFIGURATION.md`.
- `.env` is gitignored; `backend/.env.example` lists required and optional variables with placeholders.
- A previously hardcoded Django `SECRET_KEY` lived in `settings.py` and remains in git history; generate a new key for any shared or deployed environment.
- No Docker, no GitHub Actions. Backend lock: `requirements.in` + pip-compile `requirements.txt` (Python **3.13** verified). Frontend: `package-lock.json` (`npm ci` on Node **24.14.0** / npm **11.9.0**).

### Existing checks

- **Implemented:** `backend/movies/tests.py` — search requires `query`; mocked TMDB search/details payloads; 404 from TMDB. `backend/config/tests.py` — SECRET_KEY / DEBUG / host parsing and dotenv precedence.
- **Empty stubs:** `accounts/tests.py`, `ratings/tests.py`, `recommendations/tests.py`, `watchlist/tests.py`.
- **None:** CI, frontend tests, browser tests, recommender unit tests, auth/rating isolation tests.
- Django `TestCase` uses the project’s PostgreSQL engine; tests assume a reachable Postgres unless settings are later split for CI.

## Target architecture (direction)

Keep a modular Django application, React frontend, PostgreSQL as system of record, and later background workers.

Recommendation pipeline (future):

1. Candidate retrieval
2. Deduplication and eligibility filtering
3. Feature generation
4. Ranking
5. Diversity-aware reranking
6. Response construction with model/version provenance

Python recommendation package: batch-capable `fit` / `score` / `recommend`; evaluation CLI independent of HTTP.

Incremental stack (install only when a task needs it): TypeScript migration, TanStack Query, pgvector, Redis, Celery, PyTorch, Sentence Transformers, LightGBM, Parquet/DuckDB, MLflow, Docker Compose, GitHub Actions, Locust, Terraform, OpenTelemetry.

## Implementation status

| Area | Status |
|------|--------|
| TMDB search + details API | Implemented (local and historically on Lambda) |
| Token auth | Implemented |
| Ratings CRUD (own rows only via `request.user` filters) | Implemented; isolation not regression-tested |
| User-based CF endpoint | Implemented; experimental quality, not evaluated |
| Persistent watchlist | Planned (Phase 2) |
| Canonical movie catalog + MovieLens IDs | Planned (Phase 2) |
| Offline splits, Recall@K / NDCG@K | Planned (Phase 3) |
| Content CF / MF / BPR baselines | Planned (Phase 4) |
| Semantic search / embeddings | Planned (Phase 5) |
| Interaction logging | Planned (Phase 6) |
| Two-tower, LTR, diversity, serving, cloud, SASRec | Planned (Phases 7–12) |

## Compatibility constraints

- Do not silently change TMDB-backed movie endpoint JSON, token auth header (`Authorization: Token …`), or rating score semantics (1–5).
- Additive migrations preferred. Any movie-ID or watchlist persistence change needs a documented API transition.
- Seed users `alice` / `bob` / `carol` (`demo1234`) are for **local demos only**.
