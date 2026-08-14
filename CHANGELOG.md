# Changelog

All versions use **CalVer (YYYY.MM.PATCH)** after the fork.

Maintainer: **Igor Samarin** ([@isamarin](https://github.com/isamarin))

## [Unreleased]

## [2026.8.4] - 2026-08-14

### Changed
- Dependencies updated via `pnpm update`
- Version bump to 2026.8.4

## [2026.8.3] - 2026-08-14

### Changed
- Dependencies updated via `pnpm update`
- Version bump to 2026.8.3

## [2026.8.2] - 2026-08-06

### Fixed (desktop-tauri)
- **xCloud library:** load catalog with xCloud GSSV token (not xHome); xHome `/v2/titles` 500 without a paired console was mis-shown as “Failed to retrieve streaming tokens”
- **Friends sidebar:** cache presence list across route changes so tab switches no longer re-fetch and flash “Loading…”
- **Boot splash:** black text outline on “Loading Blacklight…” for readability on the hero background

### Added
- **mcp-debug v0.3:** expanded local stdio MCP tools (auth status redacted, ports, smoke scripts, app settings); root `pnpm mcp:debug` / `pnpm mcp:doctor`

### Changed
- Catalog errors use `catalog_failed` copy instead of forcing re-login; region-hint skips catalog failures

## [2026.8.1] - 2026-08-05

### Added (desktop-tauri)
- **UI redesign (beta):** design-aligned shell — accent tokens (Xbox green), solid CTAs, home continue-hero, game tile grid, console cards, profile hero, stream connect + bottom HUD
- **Nav order:** Home → Consoles → Library → Profile → Settings (top bar)
- **Debug unlock:** Settings → About — tap build version 7 times to show Debug (session-scoped)
- **Auth:** brand monogram card, solid login CTA, high-contrast user-code panel
- **Screenshot privacy (temporary):** friends list shows placeholder names/presence while `SCREENSHOT_MASK_FRIENDS` is enabled

### Changed (desktop-tauri)
- Surface/tokens and glass polish across shell; library and home use shared tile grid layout

## [2026.7.13] - 2026-07-02

### Added (desktop-tauri, platform)
- **Profile page:** gamertag, gamerscore, avatar; 6-tile grid of recently played games with hours; 6 recent achievements
