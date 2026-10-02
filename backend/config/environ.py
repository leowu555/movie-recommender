"""Load Django settings from the process environment and optional backend/.env."""

from __future__ import annotations

import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

TRUE_VALUES = frozenset({'1', 'true', 'yes', 'on'})
FALSE_VALUES = frozenset({'0', 'false', 'no', 'off'})

DEFAULT_ALLOWED_HOSTS = ['localhost', '127.0.0.1']
DEFAULT_CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
]

SECRET_KEY_HELP = (
    'SECRET_KEY is not set. Generate one with:\n'
    '  python -c "from django.core.management.utils import get_random_secret_key; '
    'print(get_random_secret_key())"\n'
    'Then add it to backend/.env or the process environment.'
)


def load_local_env(base_dir: Path) -> None:
    load_dotenv(base_dir / '.env', override=False)


def require_secret_key(env=None) -> str:
    env = os.environ if env is None else env
    value = env.get('SECRET_KEY')
    if value is None or not str(value).strip():
        raise ImproperlyConfigured(SECRET_KEY_HELP)
    return str(value)


def parse_debug(env=None) -> bool:
    env = os.environ if env is None else env
    if 'DEBUG' not in env:
        return False
    raw = str(env.get('DEBUG', '')).strip()
    if not raw:
        raise ImproperlyConfigured(
            'DEBUG is set but empty. Use a true/false value or omit DEBUG (defaults to false).'
        )
    lowered = raw.lower()
    if lowered in TRUE_VALUES:
        return True
    if lowered in FALSE_VALUES:
        return False
    raise ImproperlyConfigured(
        f'DEBUG={raw!r} is invalid. Allowed values (case-insensitive): '
        f'{", ".join(sorted(TRUE_VALUES | FALSE_VALUES))}.'
    )


def parse_csv_list(value: str) -> list[str]:
    return [item.strip() for item in value.split(',') if item.strip()]


def parse_allowed_hosts(env=None) -> list[str]:
    env = os.environ if env is None else env
    if 'ALLOWED_HOSTS' not in env:
        return list(DEFAULT_ALLOWED_HOSTS)
    raw = env.get('ALLOWED_HOSTS')
    if raw is None or not str(raw).strip():
        raise ImproperlyConfigured(
            'ALLOWED_HOSTS is set but empty. Provide a comma-separated host list '
            '(for example localhost,127.0.0.1) or omit the variable to use local defaults.'
        )
    return parse_csv_list(str(raw))


def parse_cors_allowed_origins(env=None) -> list[str]:
    env = os.environ if env is None else env
    if 'CORS_ALLOWED_ORIGINS' not in env:
        return list(DEFAULT_CORS_ALLOWED_ORIGINS)
    raw = env.get('CORS_ALLOWED_ORIGINS')
    if raw is None or not str(raw).strip():
        raise ImproperlyConfigured(
            'CORS_ALLOWED_ORIGINS is set but empty. Provide a comma-separated list of '
            'origins (for example http://localhost:5173) or omit the variable to use local defaults.'
        )
    return parse_csv_list(str(raw))


def parse_csrf_trusted_origins(env=None) -> list[str]:
    env = os.environ if env is None else env
    if 'CSRF_TRUSTED_ORIGINS' not in env:
        return []
    raw = env.get('CSRF_TRUSTED_ORIGINS')
    if raw is None or not str(raw).strip():
        return []
    return parse_csv_list(str(raw))
