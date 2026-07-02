#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${BLACKLIGHT_PORT:-9003}"
DATA_DIR="${BLACKLIGHT_DATA_DIR:-$HOME/.blacklight}"
LOG_FILE="${ROOT}/.dev-api.log"
PID_FILE="${ROOT}/.dev-api.pid"
TARGET_TRIPLE="$(rustc --print host-tuple)"
BINARY="${ROOT}/src-tauri/binaries/blacklight-api-${TARGET_TRIPLE}"
HEALTH_URL="http://127.0.0.1:${PORT}/health"

if ! [ -f "${BINARY}" ]; then
	bash "${ROOT}/scripts/ensure-api-binary.sh"
fi

if command -v lsof >/dev/null 2>&1; then
	if lsof -tiTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
		echo "[dev] API already listening on 127.0.0.1:${PORT}"
		exit 0
	fi
fi

mkdir -p "${DATA_DIR}"
: > "${LOG_FILE}"

echo "[dev] Starting blacklight-api on 127.0.0.1:${PORT}"
nohup env BLACKLIGHT_DATA_DIR="${DATA_DIR}" BLACKLIGHT_PORT="${PORT}" "${BINARY}" >>"${LOG_FILE}" 2>&1 &
API_PID=$!
echo "${API_PID}" > "${PID_FILE}"
disown "${API_PID}" 2>/dev/null || true

for _ in $(seq 1 40); do
	if curl -sf "${HEALTH_URL}" >/dev/null 2>&1; then
		echo "[dev] API ready (${HEALTH_URL})"
		exit 0
	fi
	if ! kill -0 "${API_PID}" 2>/dev/null; then
		echo "[dev] API process exited early. Log:" >&2
		tail -20 "${LOG_FILE}" >&2 || true
		exit 1
	fi
	sleep 0.25
done

echo "[dev] API failed to become ready within 10s. Log:" >&2
tail -20 "${LOG_FILE}" >&2 || true
exit 1