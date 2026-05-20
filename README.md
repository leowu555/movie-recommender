# movie-recommender

Movie Recommender is a full-stack project with a Django backend and React frontend.
Right now, the backend movie APIs are working locally and on AWS Lambda, and the frontend is set up with Vite + React.

## Current Tech Stack
- Frontend: React (Vite)
- Backend: Django + Django REST Framework
- Database (current): SQLite
- External API: TMDB API
- Serverless deployment: AWS Lambda (via Mangum)

## What Is Built So Far

### Backend
- Django project with apps: `movies`, `accounts`, `ratings`, `watchlist`, `recommendations`
- Working movie search endpoint:
  - `GET /api/movies/search?query=<movie_name>`
- Working movie details endpoint:
  - `GET /api/movies/<movie_id>/`
- TMDB integration with simplified JSON responses
- Error handling for missing query, not found, and upstream failures
- CORS enabled for local frontend (`http://localhost:5173`)
- Automated tests for movies endpoints

### Frontend
- Vite + React app scaffolded in `frontend/`
- Basic search UI wired to call backend movie search API

### AWS / Deployment Progress
- Lambda handler configured at:
  - `config.lambda_handler.handler`
- Backend packaged and uploaded to AWS Lambda
- Lambda Function URL created and tested
- Public search endpoint through Lambda is returning movie results

## Local Development

### 1) Run backend
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### 2) Run frontend
```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173` and backend runs at `http://127.0.0.1:8000`.

## Next Planned Features
- User authentication APIs
- Ratings and watchlist APIs
- Personalized recommendations
- PostgreSQL migration
- Production API Gateway integration for Lambda