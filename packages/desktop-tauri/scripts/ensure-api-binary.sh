#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TARGET_TRIPLE="$(rustc --print host-tuple)"
BINARY="src-tauri/binaries/blacklight-api-${TARGET_TRIPLE}"

if [ -f "${BINARY}" ]; then
	echo "[dev] API sidecar present: ${BINARY}"
	exit 0
fi

echo "[dev] API sidecar missing, building once..."
pnpm build:api