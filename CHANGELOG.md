# Changelog

All versions use **CalVer (YYYY.MM.PATCH)** after the fork.

Maintainer: **Igor Samarin** ([@isamarin](https://github.com/isamarin))

## [Unreleased]

## [2026.7.4] - 2026-07-02

### Fixed (desktop-tauri)
- **WKWebView blank screen** on startup and in dev/release builds (SPA paths, `display: contents`, SvelteKit boot global)
- **Xbox auth** — auto-start API sidecar, CORS + Vite preview proxy for `/trpc`, tRPC proxy and i18n nesting fixes
- **Dev workflow** — stable `tauri:dev` via preview on `127.0.0.1:4173`, skip API rebuild loop, stop stale preview ports

### Added
- **Tests:** unit coverage for platform tRPC/smartglass, player server/chat, desktop-tauri lib/api, Cloudflare pages worker; unified `pnpm test` in CI
- **E2E smoke:** `pnpm smoke:e2e` — blacklight-api auth/stream checks + static UI routes; CI job `smoke_e2e`

## [2026.7.3] - 2026-07-02

### Added (desktop-tauri)
- **P0 Remote Play wake** ([#702](https://github.com/unknownskl/greenlight/issues/702), [#1042](https://github.com/unknownskl/greenlight/issues/1042)): SmartGlass `powerOn`, wake / wake-and-stream on consoles page, auto-wake before home stream
- **P0 Mic WebRTC** ([#365](https://github.com/unknownskl/greenlight/issues/365)): chat SDP renegotiation + stream overlay mic toggle wired to WebRTC

### Changed
- **License:** MIT → [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0) — commercial use is not permitted without separate permission

## [2026.7.2] - 2026-07-02

### Added (desktop-tauri)
- **Tauri 2 desktop app** with SvelteKit 2 + Svelte 5 UI (replaces Electron `desktop-v3` shell)
- Minimal **`blacklight-api`** sidecar (`/health`, `/trpc` only) — optional spawn via `webui_autostart` (default off)
- Tauri invoke API for app settings (`app-settings.json`) and auth token (`user-token.json`) persistence
- `/profile` route and stream player integration (`@blacklight/player`)
- **P0 reliability hardening** (upstream pain points):
  - Force region via `X-Forwarded-For` on MSAL auth ([#1199](https://github.com/unknownskl/greenlight/issues/1199))
  - Streaming token failures: friendly errors + retry on sign-in ([#1506](https://github.com/unknownskl/greenlight/issues/1506))
  - xCloud library: timeout, missing-token hint, error UI + retry ([#1609](https://github.com/unknownskl/greenlight/issues/1609))
  - Stream connect: 90s timeout, player status errors, retry / go back ([#896](https://github.com/unknownskl/greenlight/issues/896))
- Smoke scripts: `smoke-test-ui.sh`, `smoke-test-p0.sh`

### Changed (rename)
- **Greenlight → Blacklight** — product name, packages (`@blacklight/*`), bundle IDs, env vars
- Tagline: *an Xbox streaming tool* (xCloud + home streaming)
- Repository target: [isamarin/blacklight](https://github.com/isamarin/blacklight)

### Changed (rebrand)
- Product branding: `com.isamarin.blacklight` (Tauri), `io.github.isamarin.blacklight` (Flatpak legacy)
- README and package metadata reflect independent maintenance by Igor Samarin

### Changed
- **desktop-v3:** Electron removed; package is renderer + web only (`build:renderer`, `build:web`)
- **CI:** `check_tauri`, `build_web` from SvelteKit; Tauri macOS → Windows pipeline is the desktop track
- **CI:** V3 Electron release job and Flatpak jobs removed (Linux out of scope for Tauri)
- **player:** `onStatusChanged` now reports stream state; errors include server detail

### Removed
- `packages/desktop-v3/main/` Electron shell, nextron, electron-builder, flatpak manifests
- Renderer IPC tRPC path (`trpcIpc` / `ipc-link`)
- Heavy Express sidecar + bundled static WebUI assets (replaced by minimal API + embedded SvelteKit UI)

## [2026.07.1-alpha.1] - 2026-06-17

### Added (desktop-v3)
- Ported v2 functionality via tRPC: consoles, xCloud library, streaming, settings, i18n
- Localhost WebUI server (Express + HTTP tRPC) on `127.0.0.1:9003`
- MSAL token refresh on startup when stored tokens expire

### Changed
- electron-builder branding: `com.unknownskl.blacklight`, Blacklight product name
- CI: fixed V3 release artifact paths (`packages/desktop-v3/dist/*`)

## [2026.06.2-alpha.1] - 2026-06-17

### Fork (isamarin/blacklight)
- Switched to CalVer versioning
- Updated dependencies in `packages/desktop-v3` (Electron ^42.4.1, TypeScript ^5.8.2, etc.)
- Updated repository URL to point to fork
- Migrated package manager from Yarn to pnpm
- Prepared desktop-v3 for further modernization
- Initial setup for continued v3 development

---

## Upstream History (unknownskl/greenlight)

Historical changelog entries below refer to the original project by UnknownSKL.

### v2.4.2 - 2026-04-24
- Fixed frontend error when token expired
- Added German language support

### v2.4.1 - 2025-12-11
- Fixed startup error when unable to retrieve xCloud token

For the complete upstream history, see [unknownskl/greenlight](https://github.com/unknownskl/greenlight).