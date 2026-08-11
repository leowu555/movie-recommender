# movie-recommender

A full-stack movie recommendation platform built with **Django**, **React**, **PostgreSQL**, **scikit-learn**, and the **TMDB API**. Movie search/details are also deployed as a serverless API on **AWS Lambda**.

---

## Tech stack

| Layer | Technology |
|--------|------------|
| Frontend | React (Vite) |
| Backend | Django + Django REST Framework |
| Database | PostgreSQL |
| ML | scikit-learn (user-based collaborative filtering) |
| External API | TMDB |
| Cloud | AWS Lambda (Function URL for movie search/details) |

---

## What’s built

### Core product
- Movie **search** and **details** powered by TMDB
- Polished React UI (sorting, toasts, details pages, watchlist UI)
- **User auth** — register, login, logout, profile
- **Ratings** — 1–5 star ratings stored in PostgreSQL
- **Personalized recommendations** — collaborative filtering with cosine similarity
- Browser **watchlist** (localStorage; ratings/recommendations use the database)

### Backend apps
- `movies` — TMDB search + details proxy
- `accounts` — auth APIs
- `ratings` — user ratings
- `recommendations` — CF recommendations
- `watchlist` — scaffolded for future DB-backed watchlist

---

## Architecture (local demo)

```
Browser (React @ localhost:5173)
    ↓ HTTP
Django API (localhost:8000)
    ├── PostgreSQL  → users, ratings, tokens
    └── TMDB API    → movie metadata / posters
```

Recommendations build a **user–movie rating matrix**, compute **cosine similarity** between users (scikit-learn), and suggest highly rated movies from similar users.

---

## Local setup

### 1) Prerequisites
- Python 3 + backend `venv`
- Node.js / npm
- PostgreSQL 16 (`brew install postgresql@16`)

### 2) Backend

```bash
cd backend
source venv/bin/activate
brew services start postgresql@16

# First-time DB (if needed)
createdb movie_recommender

# Env vars: copy .env.example → .env and set TMDB_API_KEY + DB_* values
python manage.py migrate
python manage.py shell -c "exec(open('seed_demo_data.py').read())"
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

### 3) Frontend (second terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`  
By default it calls the **local** Django API (`http://127.0.0.1:8000`).

To point frontend at Lambda instead:

```bash
# frontend/.env
VITE_API_BASE_URL=https://YOUR_LAMBDA_URL
```

> Note: auth / ratings / recommendations currently require the **local** Django + PostgreSQL stack.

---

## Demo accounts

| Username | Password |
|----------|----------|
| `alice` | `demo1234` |
| `bob` | `demo1234` |
| `carol` | `demo1234` |

These users are seeded with overlapping ratings so collaborative filtering returns useful results.

---

## Interview / demo flow

1. Start Postgres + backend + frontend
2. Search a movie (e.g. Inception)
3. Log in as `alice` / `demo1234`
4. Open a movie → rate it with stars
5. Open **For You** → see CF recommendations
6. Open **Profile** → see saved ratings

---

## API overview

### Movies
- `GET /api/movies/search?query=<title>`
- `GET /api/movies/<tmdb_id>/`

### Auth
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`

### Ratings (authenticated)
- `GET /api/ratings/`
- `POST /api/ratings/` — body: `{ movie_id, title, poster_url, score }`
- `GET /api/ratings/<movie_id>/`
- `DELETE /api/ratings/<movie_id>/`

### Recommendations (authenticated)
- `GET /api/recommendations/`

Auth header format:

```http
Authorization: Token <token>
```

---

## AWS status

- Movie search/details API packaged and deployed to **AWS Lambda**
- Public Function URL tested successfully
- Local app currently uses Django + Postgres for the full auth/ratings/recommendations demo

### Not fully productionized yet
- API Gateway in front of Lambda
- React frontend hosted on S3
- DB-backed watchlist synced to accounts

---

## Project structure

```
movie-recommender/
├── backend/
│   ├── config/           # Django settings, URLs, Lambda handler
│   ├── movies/           # TMDB search + details
│   ├── accounts/         # Auth
│   ├── ratings/          # Ratings model + API
│   ├── recommendations/  # Collaborative filtering
│   ├── seed_demo_data.py
│   └── requirements.txt
└── frontend/
    ├── src/pages/        # Home, details, auth, profile, recommendations
    ├── src/context/      # Auth state
    └── src/api.js        # API base URL + auth headers
```
