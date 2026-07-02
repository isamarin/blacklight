# Agent session snapshot — Blacklight

> Maintainer: Igor Samarin — `isamarin/blacklight` (independent product, CalVer).

## Project

- **Repo:** `/Users/igor/WebstormProjects/blacklight`
- **Desktop:** `packages/desktop-tauri` (Tauri 2 + SvelteKit 5)
- **API:** minimal `blacklight-api` (`/health`, `/trpc`)
- **Version:** `2026.7.2`
- **Release tags:** `v2026.7.2` (CalVer) — **not** `v3.*` (fork era, deprecated)

## Scripts (current)

```bash
pnpm build:deps          # was build:depsv3
pnpm check:tauri
pnpm test:workspace
pnpm desktop-tauri tauri:dev
pnpm desktop-tauri tauri:build
```

## CI / releases

- Tauri draft release: push tag matching `v20*` (e.g. `v2026.7.2`)
- Legacy v2 Electron: `v2*` tags only
- Fork tag `v3.2026.7.2` — obsolete naming; use `v2026.7.2` going forward

## Phases

| Phase | Status |
|-------|--------|
| 0–7 Migration + P0 | ✅ |
| 8 Release RC | 🟡 CI + manual Xbox smoke |
| 9 Polish | 🟡 player/consoles/clear-data/i18n done; mic/queue overlay pending |
| 10 Shell (updater, launch args) | pending |
| 11 Legacy cleanup (desktop-v3, v2 CI) | pending |

## Agent config

- `.grok/config.toml` — `blacklight-debug`, `github` MCP, permissions
- `gh auth` + `grok_com_github` for orchestration