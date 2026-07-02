#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

PORT="${BLACKLIGHT_PORT:-9003}"
DATA_DIR="${BLACKLIGHT_DATA_DIR:-$HOME/.blacklight}"
MEDIA_PROBE_URL="http://127.0.0.1:${PORT}/media"

stop_listener() {
	if ! command -v lsof >/dev/null 2>&1; then
		return 0
	fi

	local pids
	pids="$(lsof -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)"
	if [ -n "${pids}" ]; then
		echo "[dev] Stopping API listener on 127.0.0.1:${PORT}"
		kill ${pids} 2>/dev/null || true
		sleep 0.3
	fi
}

api_supports_media() {
	local code
	code="$(curl -s -o /dev/null -w "%{http_code}" "${MEDIA_PROBE_URL}" 2>/dev/null || true)"
	[ "${code}" != "404" ] && [ -n "${code}" ]
}

if command -v lsof >/dev/null 2>&1; then
	if lsof -tiTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
		if api_supports_media; then
			echo "[dev] API already listening on 127.0.0.1:${PORT}"
			exit 0
		fi

		echo "[dev] Replacing stale API sidecar (missing /media) on 127.0.0.1:${PORT}"
		stop_listener
	fi
fi

mkdir -p "${DATA_DIR}"
echo "[dev] Starting blacklight-api (tsx) on 127.0.0.1:${PORT}"
exec env BLACKLIGHT_DATA_DIR="${DATA_DIR}" BLACKLIGHT_PORT="${PORT}" pnpm exec tsx api/server.ts