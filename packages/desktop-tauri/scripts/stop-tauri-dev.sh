#!/usr/bin/env bash
set -euo pipefail

PORT="${TAURI_DEV_PORT:-4173}"

if command -v lsof >/dev/null 2>&1; then
	PIDS="$(lsof -tiTCP:"${PORT}" -sTCP:LISTEN 2>/dev/null || true)"
	if [ -n "${PIDS}" ]; then
		kill ${PIDS} 2>/dev/null || true
	fi
fi

pkill -f "target/debug/blacklight-desktop-tauri" 2>/dev/null || true