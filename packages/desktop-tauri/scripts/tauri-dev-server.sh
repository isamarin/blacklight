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

vite build
exec vite preview --host "${HOST}" --port "${PORT}" --strictPort