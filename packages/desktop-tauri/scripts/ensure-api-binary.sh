#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TARGET_TRIPLE="$(rustc --print host-tuple)"
BINARY="src-tauri/binaries/blacklight-api-${TARGET_TRIPLE}"

needs_rebuild() {
	if ! [ -f "${BINARY}" ]; then
		return 0
	fi

	for source in api/server.ts api/image-cache.ts api/cors.ts api/port.ts; do
		if [ "${ROOT}/${source}" -nt "${ROOT}/${BINARY}" ]; then
			return 0
		fi
	done

	return 1
}

if needs_rebuild; then
	echo "[dev] Building API sidecar..."
	pnpm build:api
else
	echo "[dev] API sidecar up to date: ${BINARY}"
fi