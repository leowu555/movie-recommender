# CineRank

Search live TMDB titles, rate them 1–5, and get personalized recommendations from **user-based collaborative filtering**.

This repository is a working full-stack product (Django + React + PostgreSQL) plus a documented path toward measured recommenders. The live loop is real. Offline ranking metrics (Recall@K, NDCG@K) are **not** implemented yet; seed users are a **demo fixture**, not an evaluation set.

Long-term plan: [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md) · tasks: [`docs/ROADMAP.md`](docs/ROADMAP.md) · install: [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) · env vars: [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md)

---

## Demo (5 minutes)

Prerequisites and install: [Quick start](#quick-start) or [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md). Seed only if you want these accounts:

```bash
cd backend
python manage.py shell -c "exec(open('seed_demo_data.py').read())"
```

| Username | Password   | Taste (seed ratings) |
|----------|------------|----------------------|
| `alice`  | `demo1234` | Nolan / prestige: Inception, Dark Knight, Interstellar, Fight Club, Shawshank |
| `bob`    | `demo1234` | Mix: Inception, Dark Knight, Parasite, Pulp Fiction, Forrest Gump |
| `carol`  | `demo1234` | Drama / festival: Interstellar, Parasite, Shawshank, Forrest Gump, Pulp Fiction |

Open **http://127.0.0.1:5173** (use `127.0.0.1`, not `localhost`, so CORS matches the API).

1. Search **Inception** — catalog comes from TMDB through Django, not from a local movie table.
2. Log in as **alice**.
3. Open **For You**. With only the seed ratings, you should see **Pulp Fiction**, **Parasite**, and **Forrest Gump** (`method`: `collaborative_filtering`). Alice never rated those; Bob and Carol did, and they overlap with Alice on Nolan/prestige titles.
4. Rate something new (for example a title Bob/Carol did not seed). Refresh **For You** — the matrix is rebuilt on that request.
5. **Profile** shows alice’s stored ratings. **Watchlist** is browser `localStorage` (not per-account in Postgres).

Log in as **bob** or **carol** to see a different neighbor set (table below).

Lambda Function URL (if you point `VITE_API_BASE_URL` at it) covers **search and details only**. Auth, ratings, and recommendations need local Django + Postgres.

---

## What is implemented vs planned

| Working now | Not yet (do not demo as done) |
|-------------|-------------------------------|
| TMDB search + details | Canonical `Movie` table / MovieLens IDs |
| DRF token auth, ratings in Postgres | Persistent per-user watchlist |
| In-request user–user CF | Train/serve split, Recall@K / NDCG@K |
| React: search, details, rate, For You, profile | Hybrid / two-tower / LTR |
| Optional Lambda zip for the TMDB proxy | Frontend on S3, API Gateway |

---

## Architecture

```text
React (Vite)  --REST JSON-->  Django + DRF
                                 |           |
                          PostgreSQL      TMDB HTTP
                          users, tokens,  live catalog
                          ratings

Optional: same ASGI app via Mangum on a Lambda Function URL
(movie search/details in practice; no Postgres personalization on that path)
```

**Identity:** Django `auth.User`. Movie identity is the **TMDB integer** on `ratings.Rating.movie_id`. There is no `Movie` model; title and poster are denormalized onto the rating row for the UI.

**Why that split:** Discovery should stay current with TMDB. Personalization only needs titles users have already rated. A catalog table is a later ingest problem (Phase 2), not a blocker for CF on overlapping ratings.

**Why one Django process:** The recommender is a single view over a small rating table. Splitting trainer, feature store, and model server would not change the demo and would hide the algorithm. When offline eval exists, algorithms move to a Python package with `fit` / `score` / `recommend` that does not need HTTP ([ADR 0001](docs/decisions/0001-keep-django-monolith.md)).

---

## Recommendation algorithm

`GET /api/recommendations/` (header `Authorization: Token …`).

### Steps

1. Load **all** ratings. Distinct users × distinct `movie_id`s become a dense NumPy matrix. Unrated cells are **0**.
2. If the current user has no ratings, or the table is empty → `{ "method": "empty" }`.
3. If there is only one user in the matrix → return that user’s top scores → `{ "method": "fallback_self" }`.
4. `sklearn.metrics.pairwise.cosine_similarity` on user rows. Zero the current user’s self-similarity. Take up to **5** neighbors with similarity **> 0**.
5. From those neighbors, consider movies scored **≥ 4** that the current user has not rated. Rank by `similarity × neighbor_score` (keep the max if two neighbors both liked it). Return up to **10** items → `{ "method": "collaborative_filtering" }`.
6. If that set is empty → other users’ distinct titles (not a true popularity rank) → `{ "method": "fallback_popular" }`.

`predicted_score` in the JSON is the **neighbor’s rating**, not a fitted predicted rating.

### Why user–user cosine

- The product question is “people like you also liked …”, which maps directly onto user similarity.
- Cosine is the default in scikit-learn and is easy to explain: overlap in direction of the rating vector, not raw magnitude.
- Item–item CF, matrix factorization, and content features need a catalog and a train/test protocol this repo does not have yet.

### Known limitations (intentional for this version)

| Choice | Effect |
|--------|--------|
| Zeros in the dense matrix | Cosine treats “never rated” like a 0. That is **not** “dislike”; it distorts similarity as the catalog of rated IDs grows. Sparse item–item CF is the planned fix. |
| Rebuild on every request | Correct for a demo-sized table; not a serving architecture. |
| Candidates = already-rated movies only | Cannot recommend a TMDB title nobody in the database has rated. |
| No train/test split | Cannot claim generalization. Seed walkthrough ≠ model quality. |
| `fallback_popular` uses `.distinct()[:5]` | Order is not “most rated”; it is a sparse-overlap escape hatch. |

---

## Measured results

**Not measured:** Recall@K, NDCG@K, latency SLOs, A/B, production QPS. Do not treat the seed walkthrough as those.

### Seed-set collaborative filtering (reproducible)

Input: `backend/seed_demo_data.py` only (three users, eight movies). Same procedure as `recommendations/views.py` (dense cosine, neighbors with sim > 0, neighbor score ≥ 4, rank `sim × score`).

User–user cosine on that matrix:

|        | alice  | bob    | carol  |
|--------|--------|--------|--------|
| alice  | 1.000  | 0.418  | 0.404  |
| bob    | 0.418  | 1.000  | 0.532  |
| carol  | 0.404  | 0.532  | 1.000  |

Bob and Carol share more titles (Parasite, Pulp Fiction, Forrest Gump) than either shares with Alice, so they are each other’s nearest neighbor.

Expected **For You** lists (titles the user has not rated):

| User  | Recommendations (rank order) | Why |
|-------|------------------------------|-----|
| alice | Pulp Fiction, Parasite, Forrest Gump | Closest neighbor is Bob (`sim ≈ 0.42`); he rated Pulp Fiction and Parasite 5. Forrest Gump comes from Carol (Bob rated it 3, so it is dropped by the ≥ 4 rule). |
| bob   | Shawshank, Interstellar, Fight Club | Closest neighbor is Carol (`sim ≈ 0.53`). Fight Club is Alice’s 5. |
| carol | Inception, The Dark Knight, Fight Club | Closest neighbor is Bob; Fight Club from Alice. |

If **For You** does not match this table, extra ratings exist in Postgres, or the seed was not applied.

### Automated checks (current)

From `backend/` with `SECRET_KEY` set:

```bash
python manage.py test config movies
python manage.py check
```

These cover env parsing and TMDB proxy behavior with **mocked** HTTP. There are **no** recommender or auth isolation tests yet (roadmap 1.4).

---

## Quick start

Verified: Python **3.13**, Node **24** / npm **11**, PostgreSQL **16**, TMDB API key. Details and lockfile rules: [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md).

```bash
# Postgres
brew services start postgresql@16
createdb movie_recommender   # first time only

# API
cd backend
python3.13 -m venv venv      # only if venv/ does not exist
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env         # skip if .env already exists; never overwrite secrets
# set SECRET_KEY, TMDB_API_KEY, DB_* — see docs/CONFIGURATION.md
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

```bash
# UI (second terminal)
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

UI: `http://127.0.0.1:5173` · API: `http://127.0.0.1:8000`

`pip install -r requirements.txt` does not uninstall leftover packages in an old venv. Auth is DRF **TokenAuthentication**, not JWT.

---

## API (local Django)

Auth header: `Authorization: Token <token>`

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/movies/search?query=` | no |
| GET | `/api/movies/<tmdb_id>/` | no |
| POST | `/api/auth/register/` `/login/` `/logout/` | login returns the token |
| GET | `/api/auth/me/` | yes |
| GET/POST | `/api/ratings/` | yes (own rows) |
| GET/DELETE | `/api/ratings/<movie_id>/` | yes |
| GET | `/api/recommendations/` | yes |

Rating body:

```json
{ "movie_id": 27205, "title": "Inception", "poster_url": "https://image.tmdb.org/t/p/w500/...", "score": 5 }
```

---

## Repository

```text
backend/   Django apps: movies, accounts, ratings, recommendations; Lambda handler
frontend/  React (Vite) — search, details, auth, For You, profile, watchlist
docs/      spec, roadmap, progress, config, development, ADRs
```

---

## License

Personal project for learning and portfolio use.
