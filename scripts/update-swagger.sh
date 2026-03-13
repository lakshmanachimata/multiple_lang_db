#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OPENAPI_SRC="$ROOT_DIR/openapi/openapi.json"

if [[ ! -f "$OPENAPI_SRC" ]]; then
  echo "openapi.json not found at $OPENAPI_SRC" >&2
  exit 1
fi

# Java: put under resources/static so it is served if desired
mkdir -p "$ROOT_DIR/backends/java/src/main/resources/static"
cp "$OPENAPI_SRC" "$ROOT_DIR/backends/java/src/main/resources/static/openapi.json"

# Go backend
cp "$OPENAPI_SRC" "$ROOT_DIR/backends/go/openapi.json"

# Python backend
cp "$OPENAPI_SRC" "$ROOT_DIR/backends/python/app/openapi.json"

# Node backend
cp "$OPENAPI_SRC" "$ROOT_DIR/backends/node/openapi.json"

# BFF
cp "$OPENAPI_SRC" "$ROOT_DIR/bff/openapi.json"

echo "Copied OpenAPI spec to all services."
