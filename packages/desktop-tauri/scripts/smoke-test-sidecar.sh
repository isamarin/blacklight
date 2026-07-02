#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
STATIC_DIR="${BLACKLIGHT_STATIC_DIR:-$ROOT/packages/desktop-tauri/build}"
DATA_DIR="${BLACKLIGHT_DATA_DIR:-/tmp/blacklight-smoke-test}"
PORT="${BLACKLIGHT_PORT:-19004}"
SIDECAR="${SIDECAR_BIN:-$ROOT/packages/desktop-tauri/src-tauri/binaries/blacklight-sidecar-x86_64-apple-darwin}"
BASE_URL="http://127.0.0.1:${PORT}"

if [[ ! -x "$SIDECAR" ]]; then
  echo "Sidecar binary not found: $SIDECAR" >&2
  exit 1
fi

if [[ ! -f "$STATIC_DIR/home/index.html" ]]; then
  echo "Renderer static files missing. Run: pnpm desktopv3 build:renderer" >&2
  exit 1
fi

rm -rf "$DATA_DIR"
mkdir -p "$DATA_DIR"

BLACKLIGHT_STATIC_DIR="$STATIC_DIR" \
BLACKLIGHT_DATA_DIR="$DATA_DIR" \
BLACKLIGHT_PORT="$PORT" \
"$SIDECAR" &
PID=$!

cleanup() {
  kill "$PID" 2>/dev/null || true
  wait "$PID" 2>/dev/null || true
}
trap cleanup EXIT

for _ in $(seq 1 30); do
  if curl -sf "$BASE_URL/health" >/dev/null 2>&1; then
    break
  fi
  sleep 0.2
done

echo "== health =="
curl -sf "$BASE_URL/health"
echo

echo "== static pages =="
curl -sf -o /dev/null -w "home: %{http_code}\n" "$BASE_URL/home/"
curl -sf -o /dev/null -w "settings: %{http_code}\n" "$BASE_URL/settings/"

echo "== webui settings =="
curl -sf "$BASE_URL/api/webui/settings"
echo

echo "== tRPC =="
curl -sf "$BASE_URL/trpc/ping"
echo
curl -sf "$BASE_URL/trpc/version"
echo

echo "Sidecar smoke test passed on port ${PORT}"