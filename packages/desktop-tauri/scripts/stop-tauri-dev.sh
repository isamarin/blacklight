#!/usr/bin/env bash
set -euo pipefail

pkill -f "target/debug/blacklight-desktop-tauri" 2>/dev/null || true
pkill -f "vite preview.*4173" 2>/dev/null || true