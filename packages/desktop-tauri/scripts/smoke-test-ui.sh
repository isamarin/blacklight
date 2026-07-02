#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
API="http://127.0.0.1:9003"
UI="http://localhost:5173"

echo "[smoke] sidecar health"
curl -sf "$API/health" | grep -q '"ok":true'

echo "[smoke] tRPC ping"
curl -sf "$API/trpc/ping?batch=1&input=%7B%220%22%3A%7B%7D%7D" | grep -q '"pong"'

for path in / /home /consoles /xcloud/library /settings/home; do
	echo "[smoke] vite GET $path"
	code="$(curl -s -o /dev/null -w '%{http_code}' "$UI$path")"
	[[ "$code" == "200" ]] || { echo "expected 200, got $code"; exit 1; }
done

echo "[smoke] OK"