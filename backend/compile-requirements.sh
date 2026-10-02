#!/usr/bin/env bash
# Regenerate backend/requirements.txt from requirements.in in a throwaway venv.
# Does not modify backend/venv/.
#
# Interpreter: $PYTHON if set, else backend/venv/bin/python if present, else python3.
# Requires Python 3.12+ (the lock in git was compiled with 3.13).
# pip-tools is pinned so regenerations are comparable.
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
