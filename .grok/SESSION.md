# Agent session snapshot — 2026-07-02

> Resume here after Grok/Cursor restart. Maintainer: Igor Samarin (`isamarin/blacklight`).

## Project

- **Repo:** `/Users/igor/WebstormProjects/blacklight`
- **Focus:** `packages/desktop-tauri` — Tauri 2 + SvelteKit 2 + Svelte 5
- **Backend:** minimal `blacklight-api` (`/health`, `/trpc`)
- **Version:** `2026.7.2` (CalVer)
- **Upstream fork:** [unknownskl/greenlight](https://github.com/unknownskl/greenlight)

## Git state (last known)

- **Branch:** `main`
- **Unpushed:** `da7d062` — `chore(agent): add GitHub MCP and permissions to .grok/config.toml`
- **On origin:** through `177e4a8` (`.gitignore` tweak) + full Tauri migration + `e2885bc` release bump
- **Local tag:** `v3.2026.7.2` — verify `git ls-remote --tags origin v3.2026.7.2`
- **Working tree:** clean

## Completed phases (0–8)

| Phase | Status |
|-------|--------|
| 0 Rebrand + pnpm | ✅ |
| 1 SvelteKit UI in Tauri | ✅ |
| 2 Stream player + API | ✅ |
| 3 Minimal sidecar | ✅ |
| 4 Settings/token persistence | ✅ |
| 5 Routes parity desktop-v3 | ✅ |
| 6 CI `check:tauri` | ✅ |
| 7 P0 hardening (region, tokens, library, stream) | ✅ `2f8f8df` |
| 8 Release candidate | 🟡 partial |

### Phase 8 done locally

- `pnpm check:tauri` — 0 errors
- `pnpm test:workspace` — passed
- `smoke-test-ui.sh` + `smoke-test-p0.sh` — OK
- `tauri:build` macOS DMG — OK (~25 MB)
- CHANGELOG `[2026.7.2]`
- User pushed `main` (12 commits through release)

### Phase 8 still open

- [ ] `git push origin main` — commit `da7d062` (agent config)
- [ ] `git push origin v3.2026.7.2` — if tag not on remote
- [ ] CI green on tag push → draft GitHub Release (DMG + NSIS)
- [ ] Publish draft release
- [ ] Manual Xbox smoke (auth, library, consoles, stream)
- [ ] User: `export GITHUB_PAT` + `gh auth setup-git` (see `.grok/config.toml`)

## Key commits (Tauri track)

```
da7d062 chore(agent): .grok/config.toml GitHub MCP + permissions
e2885bc chore(release): bump to 2026.7.2
2f8f8df feat(desktop-tauri): P0 reliability hardening
cf3ef51 fix(platform): force_region_ip MSAL
179a5ff feat: auth token persistence
169b693 feat: minimal blacklight-api
9a4ef37 feat: SvelteKit 2 + Svelte 5 migration
```

## Architecture

- **Settings:** `app-settings.json`, `sidecar-settings.json` (Tauri app data)
- **Auth token:** `user-token.json` (Tauri app data)
- **API spawn:** only if `webui_autostart` (default `false`)
- **CI:** `check_tauri` → `tauri_macos` → `tauri_windows`; release on `v3.*` tags
- **P0 errors:** `packages/desktop-tauri/src/lib/errors.ts`, `ErrorPanel.svelte`

## Next phases (after 8)

- **9 Polish:** player debug UI, consoles error/retry, Clear Data, stream overlay, i18n settings
- **10 Shell:** updater, `--fullscreen`, `--connect`
- **11 Cleanup:** remove desktop-v3 renderer, retire v2 Electron CI

## Agent setup

- **Config:** `.grok/config.toml` — `blacklight-debug` + `github` MCP (`${GITHUB_PAT}`)
- **Smoke:** `bash packages/desktop-tauri/scripts/smoke-test-p0.sh`
- **Verify:** `pnpm check:tauri`, `pnpm test:workspace`
- **Build:** `pnpm desktop-tauri tauri:build`

## Verification commands

```bash
pnpm build:depsv3
pnpm check:tauri
pnpm test:workspace
bash packages/desktop-tauri/scripts/smoke-test-p0.sh   # API :9003 + Vite :5173
pnpm desktop-tauri tauri:build
```

## User preferences

- Pushes manually when agent lacks git credentials
- Tests deferred ("тесты потом") for live Xbox
- CalVer versioning; independent fork maintenance