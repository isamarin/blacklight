# Changelog

All versions use **CalVer (YYYY.MM.PATCH)** after the fork.

Maintainer: **Igor Samarin** ([@isamarin](https://github.com/isamarin))

## [Unreleased]

### Changed (rename)
- **Greenlight → Blacklight** — product name, packages (`@blacklight/*`), bundle IDs, sidecar binary, env vars
- Tagline: *an Xbox streaming tool* (xCloud + home streaming)
- Repository target: [isamarin/blacklight](https://github.com/isamarin/blacklight)

### Changed (rebrand)
- Product branding: `com.isamarin.blacklight` (Tauri + Electron), `io.github.isamarin.blacklight` (Flatpak)
- README and package metadata reflect independent maintenance by Igor Samarin

### Added (desktop-tauri)
- Bundled Node sidecar (`esbuild` + `pkg`) shipped as Tauri `externalBin`
- Sidecar auto-spawn on app start with `BLACKLIGHT_STATIC_DIR` and `BLACKLIGHT_DATA_DIR`
- Static UI assets bundled under `Resources/app/` (macOS) / `app/` (Windows)

### Changed
- **desktop-v3:** Electron removed; package is renderer + web only (`build:renderer`, `build:web`)
- **CI:** V3 Electron release job removed; Tauri macOS → Windows pipeline is the desktop track
- **CI:** Flatpak jobs removed (Linux out of scope for Tauri)

### Removed
- `packages/desktop-v3/main/` Electron shell, nextron, electron-builder, flatpak manifests
- Renderer IPC tRPC path (`trpcIpc` / `ipc-link`)

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