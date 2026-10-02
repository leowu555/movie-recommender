#!/usr/bin/env bash
# Compile requirements.txt from requirements.in. Does not touch backend/venv.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PIP_TOOLS_VERSION="7.6.1"

if [[ -n "${PYTHON:-}" ]]; then
  :
elif [[ -x "$ROOT/venv/bin/python" ]]; then
  PYTHON="$ROOT/venv/bin/python"
else
  PYTHON="python3"
fi

"$PYTHON" -c "import sys
print('compile interpreter:', sys.executable)
print('compile version:', sys.version.replace('\n', ' '))
if sys.version_info < (3, 12):
    raise SystemExit('Need Python 3.12+ to compile this lock (Django 6.0).')"

WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/cinerank-compile.XXXXXX")"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

"$PYTHON" -m venv "$WORKDIR/venv"
"$WORKDIR/venv/bin/pip" install "pip-tools==${PIP_TOOLS_VERSION}"
echo "pip-tools==${PIP_TOOLS_VERSION}"
(
  cd "$ROOT"
  "$WORKDIR/venv/bin/pip-compile" --strip-extras requirements.in
)

echo "Wrote $ROOT/requirements.txt"
