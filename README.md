# Movie Recommender

A full-stack movie discovery and recommendation platform that lets users search live movie data, rate films, and receive personalized recommendations.

Built with **Django**, **React**, **PostgreSQL**, **scikit-learn**, and the **TMDB API**, with a serverless movie API deployed on **AWS Lambda**.

---

## Highlights

- End-to-end product: search → details → rate → personalized recommendations
- Live movie metadata and posters from TMDB
- User authentication with token-based API access
- Ratings persisted in PostgreSQL
- User-based collaborative filtering with scikit-learn (cosine similarity)
- React frontend with search, details, auth, profile, watchlist, and “For You” pages
- Movie search/details API packaged and deployed to AWS Lambda

---

## Tech Stack

| Area | Tools |
|------|--------|
| Frontend | React, Vite, React Router |
| Backend | Django, Django REST Framework |
| Database | PostgreSQL |
| Machine Learning | scikit-learn, NumPy |
| External Data | TMDB API |
| Cloud | AWS Lambda (Function URL) |

---

## Features

### Movie discovery
- Search movies by title
- View details (overview, genres, runtime, rating, poster, tagline)
- Sort results and browse a polished UI

### Accounts & personalization
- Register / login / logout
- Profile page with rating history
- Rate movies 1–5 stars
- Personalized “For You” recommendations

### Recommendations approach
1. Build a user–movie rating matrix from PostgreSQL
2. Compute user similarity with cosine similarity (scikit-learn)
3. Recommend highly rated movies from similar users
4. Fall back gracefully when rating data is sparse

### Cloud
- Django movie search/details API deployed as a serverless Lambda function
- Local full-stack demo uses Django + PostgreSQL for auth, ratings, and recommendations

---

## Architecture

```text
┌──────────────────────────────┐
│  React Frontend (Vite)       │
│  Search · Auth · Ratings UI  │
└──────────────┬───────────────┘
               │ REST / JSON
┌──────────────▼───────────────┐
│  Django REST API             │
│  movies · accounts · ratings │
│  recommendations             │
└──────┬───────────────┬───────┘
       │               │
       ▼               ▼
 PostgreSQL         TMDB API
 (users/ratings)    (metadata)
```

**Local development** uses Django on `localhost:8000` and React on `localhost:5173`.  
**AWS Lambda** hosts the movie search/details API for serverless deployment practice.

---

## Quick Start

### Prerequisites
- Python 3
- Node.js + npm
- PostgreSQL 16
- TMDB API key

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start Postgres (macOS / Homebrew)
brew services start postgresql@16
createdb movie_recommender   # first time only

# Configure environment
cp .env.example .env
# Set TMDB_API_KEY and DB_* values in .env

python manage.py migrate
python manage.py shell -c "exec(open('seed_demo_data.py').read())"
python manage.py runserver
```

Backend: `http://127.0.0.1:8000`

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

By default the frontend calls the local Django API.  
To point at Lambda instead, create `frontend/.env`:

```bash
VITE_API_BASE_URL=https://YOUR_LAMBDA_FUNCTION_URL
```

> Auth, ratings, and recommendations require the local Django + PostgreSQL stack.

---

## Demo Accounts

| Username | Password |
|----------|----------|
| `alice` | `demo1234` |
| `bob` | `demo1234` |
| `carol` | `demo1234` |

Seeded with overlapping ratings so collaborative filtering works out of the box.

### Suggested walkthrough
1. Search for a movie (e.g. *Inception*)
2. Log in as `alice`
3. Open a movie and rate it
4. Visit **For You** for recommendations
5. Open **Profile** to view saved ratings

---

## API Reference

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies/search?query=` | Search movies via TMDB |
| GET | `/api/movies/<id>/` | Movie details |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/login/` | Log in (returns token) |
| POST | `/api/auth/logout/` | Invalidate token |
| GET | `/api/auth/me/` | Current user profile |

### Ratings (requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ratings/` | List current user’s ratings |
| POST | `/api/ratings/` | Create/update a rating |
| GET | `/api/ratings/<movie_id>/` | Get rating for one movie |
| DELETE | `/api/ratings/<movie_id>/` | Remove a rating |

### Recommendations (requires auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/recommendations/` | Personalized movie recommendations |

**Auth header**

```http
Authorization: Token <your_token>
```

**Example rating payload**

```json
{
  "movie_id": 27205,
  "title": "Inception",
  "poster_url": "https://image.tmdb.org/t/p/w500/...",
  "score": 5
}
```

---

## Project Structure

```text
movie-recommender/
├── backend/
│   ├── config/              # Django settings, URLs, Lambda handler
│   ├── movies/              # TMDB search + details
│   ├── accounts/            # Auth APIs
│   ├── ratings/             # Rating model + APIs
│   ├── recommendations/     # Collaborative filtering
│   ├── seed_demo_data.py    # Demo users + ratings
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/pages/           # App screens
    ├── src/context/         # Auth state
    ├── src/components/      # Shared UI
    └── src/api.js           # API client config
```

---

## Cloud & Roadmap

### Done
- Serverless packaging and deployment of movie search/details on AWS Lambda
- Full local stack with Postgres-backed auth, ratings, and recommendations

### Next
- Host React frontend on Amazon S3 (and optionally CloudFront)
- Put API Gateway in front of Lambda
- Persist watchlist in PostgreSQL per user
- Expand recommendation quality with more rating data / hybrid signals

---

## Why this project

This project demonstrates practical full-stack engineering:

- API design and third-party integration (TMDB)
- Relational data modeling and authentication
- A real recommendation algorithm, not just UI mock data
- Frontend product experience (routing, auth state, ratings UX)
- Cloud deployment experience with AWS Lambda

---

## License

Personal project for learning and portfolio use.
