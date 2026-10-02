# Configuration

Django reads process environment variables. If `backend/.env` exists, it is loaded **without overriding** variables already set in the process (Lambda, CI, or your shell).

Do not commit `.env`. `backend/.env.example` is the tracked template.

## Create a local environment file

```bash
cd backend
cp .env.example .env
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Paste the printed value into `SECRET_KEY` in `backend/.env`. Set `TMDB_API_KEY` and `DB_*` to match your machine. If you already have a `.env`, add `SECRET_KEY` (required) and optionally `DEBUG` / `ALLOWED_HOSTS`; do not delete the file.

Generate a new key whenever the old one may have been committed or shared.

## Variables

| Variable | Required | Default if omitted | Notes |
|----------|----------|--------------------|-------|
| `SECRET_KEY` | yes | none (startup fails) | Django signing key. Never commit the real value. |
| `TMDB_API_KEY` | for search/details | empty | Movie endpoints fail against TMDB without it. |
| `DEBUG` | no | `false` | Accepted (case-insensitive): `1`, `0`, `true`, `false`, `yes`, `no`, `on`, `off`. Other values error. Do not rely on Python `bool("False")`. |
| `ALLOWED_HOSTS` | no | `localhost,127.0.0.1` | Comma-separated hostnames. No `*`. Lambda must set its Function URL hostname. |
| `CORS_ALLOWED_ORIGINS` | no | Vite `localhost` / `127.0.0.1` ports 5173–5175 | Browser origins allowed to call the API. Token auth header is unchanged: `Authorization: Token …`. |
| `CSRF_TRUSTED_ORIGINS` | no | empty | Optional; for session/admin from another origin. |
| `DB_NAME` | no | `movie_recommender` | PostgreSQL database name. |
| `DB_USER` | no | your OS user | |
| `DB_PASSWORD` | no | empty | |
| `DB_HOST` | no | `localhost` | |
| `DB_PORT` | no | `5432` | |
| `DJANGO_SETTINGS_MODULE` | Lambda/CI | set by manage.py / lambda handler | `config.settings` |

Frontend: optional `frontend/.env` with `VITE_API_BASE_URL` (see README). That file is gitignored.

## Local startup

See [`DEVELOPMENT.md`](DEVELOPMENT.md) for locked installs, PostgreSQL, migrations, and two-terminal run. Summary:

1. PostgreSQL 16 running; database created (`createdb` only when needed).
2. `backend/.env` with `SECRET_KEY`, `TMDB_API_KEY`, `DB_*`; `DEBUG=true` is typical locally. Copy `.env.example` only if `.env` does not exist.
3. `cd backend && source venv/bin/activate && pip install -r requirements.txt && python manage.py migrate && python manage.py runserver`
4. `cd frontend && npm ci && npm run dev`

Do not treat `seed_demo_data.py` as part of ordinary startup.

Tests need a `SECRET_KEY` in the environment or `.env` because settings load at import time.

## Lambda

The Function URL does not read `backend/.env` from your laptop. Set configuration in the Lambda console (or later IaC):

- `DJANGO_SETTINGS_MODULE=config.settings`
- `SECRET_KEY` (required; not the example placeholder)
- `TMDB_API_KEY`
- `DEBUG=false` (or omit; defaults false)
- `ALLOWED_HOSTS=<function-url-hostname>` (hostname only, no `https://`)
- `CORS_ALLOWED_ORIGINS` if a browser origin other than the local Vite defaults should call the API

Redeploy or update environment variables after this change; the previous hardcoded Django secret and Lambda hostname are no longer in settings. Auth, ratings, and recommendations still need local Django + PostgreSQL unless that stack is deployed separately.
