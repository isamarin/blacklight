#!/usr/bin/env bash
set -euo pipefail

API_PORT="${BLACKLIGHT_PORT:-9003}"
UI_PORT="${BLACKLIGHT_UI_PORT:-5173}"
API="${BLACKLIGHT_API_ORIGIN:-http://127.0.0.1:${API_PORT}}"
UI="${BLACKLIGHT_UI_ORIGIN:-http://127.0.0.1:${UI_PORT}}"

echo "[smoke] API health"
curl -sf "$API/health" | grep -q '"ok":true'

echo "[smoke] tRPC ping"
curl -sf "$API/trpc/ping?batch=1&input=%7B%220%22%3A%7B%7D%7D" | grep -q '"pong"'

for path in / /home /consoles /xcloud/library /profile /settings/home /settings/streaming; do
	echo "[smoke] vite GET $path"
	code="$(curl -s -o /dev/null -w '%{http_code}' "$UI$path")"
	[[ "$code" == "200" ]] || { echo "expected 200, got $code"; exit 1; }
done

echo "[smoke] stream player bundle present"
curl -sf "$UI/" | grep -q '_app/immutable' || {
	echo "expected SvelteKit app shell on /"
	exit 1
}

echo "[smoke] OK (dynamic /stream/* routes are covered by API smoke)"