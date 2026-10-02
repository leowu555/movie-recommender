#!/usr/bin/env bash
# Regenerate backend/requirements.txt from requirements.in in a throwaway venv.
# Does not modify the project's existing venv/.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
if [[ -n "${PYTHON:-}" ]]; then
  :
elif [[ -x "$ROOT/venv/bin/python" ]]; then
  PYTHON="$ROOT/venv/bin/python"
else
  PYTHON="python3"
fi
WORKDIR="$(mktemp -d "${TMPDIR:-/tmp}/cinerank-compile.XXXXXX")"
cleanup() { rm -rf "$WORKDIR"; }
trap cleanup EXIT

"$PYTHON" -m venv "$WORKDIR/venv"
"$WORKDIR/venv/bin/pip" install --upgrade pip
"$WORKDIR/venv/bin/pip" install pip-tools
(
  cd "$ROOT"
  "$WORKDIR/venv/bin/pip-compile" --strip-extras requirements.in
)

echo "Wrote $ROOT/requirements.txt"
