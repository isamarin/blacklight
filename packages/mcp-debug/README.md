# @blacklight/mcp-debug

stdio [MCP](https://modelcontextprotocol.io) server for local Blacklight debugging.

Gives agents (Grok, Cursor, Claude Desktop, etc.) tools to inspect the running
desktop-tauri API, UI routes, app data dirs, and smoke scripts — without
exposing auth secrets.

## Quick start

From the monorepo root:

```bash
pnpm mcp:debug
# or
pnpm --filter @blacklight/mcp-debug run start
```

Self-test (starts stdio transport briefly, then exits):

```bash
pnpm mcp:doctor
# or
pnpm --filter @blacklight/mcp-debug run doctor
```

## Grok project config

Already wired in `.grok/config.toml`:

```toml
[mcp_servers.blacklight-debug]
command = "pnpm"
args = ["--filter", "@blacklight/mcp-debug", "run", "start"]
enabled = true
startup_timeout_sec = 20
tool_timeout_sec = 60

[mcp_servers.blacklight-debug.env]
BLACKLIGHT_PORT = "9003"
# Tauri preview uses 4173; plain `pnpm desktop-tauri dev` uses 5173
# BLACKLIGHT_UI_PORT = "4173"
```

Verify:

```bash
grok mcp doctor blacklight-debug
```

## Environment

| Variable | Default | Meaning |
| --- | --- | --- |
| `BLACKLIGHT_PORT` | `9003` | API sidecar port |
| `BLACKLIGHT_UI_PORT` | `4173` | UI port (Tauri `vite preview`) |
| `BLACKLIGHT_DATA_DIR` | `~/.blacklight` | Legacy data dir override |

App settings/token are also read from the Tauri data dir:

- macOS: `~/Library/Application Support/com.isamarin.blacklight`
- Windows: `%APPDATA%/com.isamarin.blacklight`
- Linux: `~/.local/share/com.isamarin.blacklight`

## Tools

| Tool | Purpose |
| --- | --- |
| `debug_summary` | One-shot snapshot (ports, health, settings, auth presence, UI, processes) |
| `api_health` | `GET /health` |
| `api_status` | Health + tRPC ping/version + settings |
| `api_version` | Health + tRPC `version` |
| `media_probe` | Confirm `/media` route is registered |
| `ui_pages` | HTTP status for key SvelteKit routes |
| `list_routes` | Known UI paths |
| `list_procedures` | Known tRPC procedures from `@blacklight/platform` |
| `trpc_query` | Read-only tRPC GET (blocks streaming mutations) |
| `port_status` | `lsof` listeners on API/UI ports |
| `process_list` | Processes matching blacklight / desktop-tauri |
| `read_data_dir` | List data-dir files (+ optional settings) |
| `read_app_settings` | `app-settings.json` + `sidecar-settings.json` |
| `auth_status` | Token present / expiry — **secrets always redacted** |
| `image_cache_stats` | File count + bytes in image-cache |
| `run_smoke_test` | `smoke-test-ui.sh` |
| `run_smoke_p0` | `smoke-test-p0.sh` |
| `repo_paths` | Monorepo path map for agents |

## Safety

- `access_token`, `refresh_token`, `id_token` and similar keys are **never**
  returned in clear text (`auth_status` redacts them).
- `trpc_query` refuses streaming / power-on mutations so agents do not
  accidentally start live Xbox sessions.

## Prerequisites

- Local API running (`pnpm desktop-tauri api` or Tauri dev autostart)
- Optional UI for route checks (`pnpm desktop-tauri tauri:dev` or `dev`)
- `lsof` / `ps` available (macOS/Linux; Windows agents may see empty listeners)
