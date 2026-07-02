#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
API_PORT="${BLACKLIGHT_PORT:-9003}"
UI_PORT="${BLACKLIGHT_UI_PORT:-5173}"
API="http://127.0.0.1:${API_PORT}"
UI="http://localhost:${UI_PORT}"

echo "[p0] API health"
curl -sf "$API/health" | grep -q '"ok":true'

echo "[p0] tRPC ping"
curl -sf "$API/trpc/ping?batch=1&input=%7B%220%22%3A%7B%7D%7D" | grep -q '"pong"'

echo "[p0] auth procedures registered (no live Xbox call)"
curl -sf "$API/trpc/auth_msal_start?batch=1&input=%7B%220%22%3A%7B%7D%7D" >/dev/null || {
	echo "auth_msal_start endpoint unreachable"
	exit 1
}

for path in / /home /xcloud/library /profile /settings/streaming /stream/xcloud_test; do
	echo "[p0] vite GET $path"
	code="$(curl -s -o /dev/null -w '%{http_code}' "$UI$path")"
	[[ "$code" == "200" ]] || { echo "expected 200, got $code for $path"; exit 1; }
done

echo "[p0] OK (live Xbox auth/stream still requires manual verification)"