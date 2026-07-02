#!/usr/bin/env bash
set -euo pipefail

PORT="${TAURI_DEV_PORT:-4173}"
HOST="${TAURI_DEV_HOST:-127.0.0.1}"

if command -v lsof >/dev/null 2>&1; then
	PIDS="$(lsof -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)"
	if [ -n "${PIDS}" ]; then
		kill ${PIDS} 2>/dev/null || true
		sleep 0.3
	fi
fi

cleanup() {
	local root
	root="$(cd "$(dirname "$0")/.." && pwd)"
	if [ -f "${root}/.dev-api.pid" ]; then
		API_PID="$(cat "${root}/.dev-api.pid" 2>/dev/null || true)"
		if [ -n "${API_PID}" ] && kill -0 "${API_PID}" 2>/dev/null; then
			kill "${API_PID}" 2>/dev/null || true
		fi
		rm -f "${root}/.dev-api.pid"
	fi
}

trap cleanup EXIT INT TERM

bash "$(dirname "$0")/ensure-api-binary.sh"
bash "$(dirname "$0")/ensure-api-running.sh"
vite build
exec vite preview --host "${HOST}" --port "${PORT}" --strictPort