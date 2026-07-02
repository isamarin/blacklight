#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
API_PORT="${BLACKLIGHT_PORT:-19003}"
UI_PORT="${BLACKLIGHT_UI_PORT:-15173}"
API_ORIGIN="http://127.0.0.1:${API_PORT}"
UI_ORIGIN="http://127.0.0.1:${UI_PORT}"

API_PID=""
UI_PID=""

cleanup() {
	if [[ -n "$API_PID" ]] && kill -0 "$API_PID" 2>/dev/null; then
		kill "$API_PID" 2>/dev/null || true
		wait "$API_PID" 2>/dev/null || true
	fi
	if [[ -n "$UI_PID" ]] && kill -0 "$UI_PID" 2>/dev/null; then
		kill "$UI_PID" 2>/dev/null || true
		wait "$UI_PID" 2>/dev/null || true
	fi
}

trap cleanup EXIT

wait_for_url() {
	local url="$1"
	local label="$2"
	local attempts=60

	for ((i = 1; i <= attempts; i++)); do
		if curl -sf "$url" >/dev/null 2>&1; then
			echo "[smoke:e2e] ${label} ready (${url})"
			return 0
		fi
		sleep 1
	done

	echo "[smoke:e2e] timed out waiting for ${label} at ${url}"
	return 1
}

echo "[smoke:e2e] building workspace dependencies"
cd "$ROOT"
pnpm build:deps
pnpm desktop-tauri build

echo "[smoke:e2e] starting blacklight-api on ${API_ORIGIN}"
BLACKLIGHT_PORT="$API_PORT" pnpm desktop-tauri api >/tmp/blacklight-smoke-api.log 2>&1 &
API_PID=$!

wait_for_url "${API_ORIGIN}/health" "API"

echo "[smoke:e2e] starting static UI preview on ${UI_ORIGIN}"
(
	cd "$ROOT/packages/desktop-tauri"
	pnpm exec vite preview --host 127.0.0.1 --port "$UI_PORT" --strictPort
) >/tmp/blacklight-smoke-ui.log 2>&1 &
UI_PID=$!

wait_for_url "${UI_ORIGIN}/" "UI"

export BLACKLIGHT_API_ORIGIN="$API_ORIGIN"
export BLACKLIGHT_UI_ORIGIN="$UI_ORIGIN"
export BLACKLIGHT_PORT="$API_PORT"
export BLACKLIGHT_UI_PORT="$UI_PORT"
export SMOKE_AUTH_TIMEOUT_MS="${SMOKE_AUTH_TIMEOUT_MS:-45000}"

echo "[smoke:e2e] running API auth/stream smoke"
pnpm desktop-tauri smoke:api

echo "[smoke:e2e] running UI route smoke"
bash "$ROOT/packages/desktop-tauri/scripts/smoke-test-ui.sh"

echo "[smoke:e2e] running P0 route smoke"
bash "$ROOT/packages/desktop-tauri/scripts/smoke-test-p0.sh"

echo "[smoke:e2e] OK"