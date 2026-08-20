# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Blacklight is an Xbox streaming client (xCloud + console home streaming) for macOS, Windows and Linux, built as a Tauri 2 desktop shell around a SvelteKit 5 UI. Streaming itself comes from external packages pinned to GitHub tags: `@blacklight/player` (xbox-xcloud-player fork) and `@blacklight/platform` (the tRPC `appRouter` with all Xbox auth/API logic). Neither lives in this repo — changing Xbox API behaviour usually means bumping those pins in `packages/desktop-tauri/package.json`.

Versioning is CalVer (`26.8.N`). Release tags are `v26.8.N` and must be kept in sync across `packages/desktop-tauri/package.json` and `src-tauri/tauri.conf.json`. `.grok/SESSION.md` predates the current scheme and still mentions `2026.7.2` / `v20*` tags — ignore it for versioning.

## Commands

pnpm workspace (`pnpm@10.4.1`, Node >= 24.17). A `Makefile` wraps the common flows — `make help` lists them.

```bash
pnpm install

pnpm dev:tauri            # build UI + start preview server on 4173 (what tauri dev points at)
pnpm desktop-tauri tauri:dev     # full native app
pnpm desktop-tauri tauri:build   # .dmg / .exe
make dev-clean            # kill stale dev processes first, then tauri dev
make stop                 # kill dev server + API sidecar

make web-all              # API (9003) + Vite dev (5173), browser-only, hot reload
make preview-all          # API + built UI on 4173 (prod-like, /trpc proxied)

pnpm lint                 # eslint over the whole workspace
pnpm test                 # vitest in desktop-tauri + pages
pnpm check:tauri          # svelte-check typecheck of the UI
pnpm smoke:e2e            # auth/stream smoke against local API + built UI (also in CI)
```

Single test file / single test:

```bash
pnpm desktop-tauri exec vitest run src/lib/consoles.test.ts
pnpm desktop-tauri exec vitest run -t "wakes a standby console"
```

Smoke scripts under `packages/desktop-tauri/scripts/` need the API and UI already running (`make web-all` in another shell): `make smoke-ui`, `make smoke-p0`.

CI (`.github/workflows/build.yml`) runs lint → test → (smoke-e2e, check:tauri, build) on push to `main`/`feature/*` and on tags `v*`. A `v26.*` / `v2026.*` tag produces a draft release.

The `tauri_desktop` job is a matrix with **one runner per architecture** — `macos-latest`, `macos-13`, `windows-latest`, `ubuntu-22.04`. That is not incidental: `api/build.mjs` resolves the sidecar name from `rustc --print host-tuple` and `pkg`-compiles for the host, so cross-compiling a target would produce a sidecar Tauri can't find under `externalBin`. Adding an architecture means adding a native runner, not a `--target` flag.

## Architecture

### Three processes, one tRPC contract

1. **Tauri shell** (`src-tauri/`, Rust) — owns the window, spawns and supervises the API sidecar, and stores all persistent state (settings, Xbox token) on disk under the app data dir.
2. **`blacklight-api` sidecar** (`packages/desktop-tauri/api/`) — a plain Node HTTP server exposing `/health`, `/trpc/*` (the `appRouter` from `@blacklight/platform`) and `/media` (disk-backed image cache). Listens on `127.0.0.1:9003` by default.
3. **SvelteKit UI** (`packages/desktop-tauri/src/`) — static-adapter SPA (`fallback: index.html`, relative paths) loaded either by the Tauri webview or a plain browser.

The same `appRouter` is also deployed to Cloudflare Workers from `packages/pages`, so the web build talks to an identical tRPC surface. `packages/pages/package.json`'s `build` script copies `desktop-tauri`'s `build/` output into `pages/public/` — the Worker is UI + tRPC in one.

### The sidecar is a compiled binary, not a script

`api/build.mjs` bundles `api/server.ts` with esbuild, then `pkg`s it into `src-tauri/binaries/blacklight-api-<host-tuple>`, which `tauri.conf.json` ships as `externalBin`. `scripts/ensure-api-binary.sh` rebuilds it when any `api/*.ts` file is newer than the binary. In dev, `scripts/start-api-dev.sh` runs `tsx api/server.ts` directly instead — and will kill and replace a listener on 9003 that fails a `/media` probe, so a stale sidecar from an older build doesn't silently serve the UI.

### Dual-mode runtime (`src/lib/runtime.ts`)

Every piece of UI must work in two environments, and `runtime.ts` is the single place that decides which:

- **Desktop shell** — `__TAURI_INTERNALS__` present. tRPC goes to `http://127.0.0.1:<port>/trpc`; settings and tokens go through Tauri IPC.
- **Web UI mode** — plain browser. Same tRPC surface, but via the Vite/Worker `/trpc` proxy.

`usesDevProxy()` special-cases ports 4173/5173 so dev and preview use relative `/trpc` (Vite proxies `/trpc`, `/health`, `/media` to the API origin — see `vite.config.ts`). The API port is discovered at runtime and cached in `localStorage`; `resetTrpcClient()` in `src/lib/trpc.ts` exists because the client bakes in the URL at construction time.

`@blacklight/platform` cannot emit portable tRPC declaration types, so `RouterOutputs` is `Record<string, any>` and the tRPC client is untyped by design. Don't try to "fix" this with local type surgery — validate at the call site instead.

### Tauri IPC (`src/lib/tauri.ts` ↔ `src-tauri/src/commands.rs`)

All commands are listed in the `generate_handler!` block in `src-tauri/src/lib.rs`; adding one means touching Rust, `src/lib/tauri.ts`, and `src-tauri/permissions/app-commands.toml`. IPC calls are wrapped in `invokeWithRetry` (8 attempts, linear backoff) because the webview can beat the Rust side to readiness — prefer `waitForTauriIpc()` over racing the first `invoke`.

`api_fetch` is a Rust-side HTTP proxy: in the packaged app the webview's origin can't reach `127.0.0.1` directly, so `desktopApiFetch` routes tRPC through Tauri rather than `fetch`.

### UI layout

Routes are screens (`home`, `consoles`, `xcloud/library`, `xcloud/info/[titleid]`, `profile`, `settings/*`, `stream/[serverid]`); `src/lib/components/` holds the reusable pieces grouped by area (`auth`, `sidebar`, `settings`, `stream`, `ui`, `xcloud`, `game`, `layout`). `src/app.css` carries the design tokens and most component classes — Tailwind v4 via `@tailwindcss/vite`, so there is no `tailwind.config`.

Theming is live, not build-time. `$lib/appearance` writes `--color-accent`, `--color-accent-dark`, `--color-accent-glow`, `--glass-blur` and `--ambient-glow-opacity` onto `<html>` from the saved settings, and a `$effect` in `src/routes/+layout.svelte` re-applies them whenever settings change. So **new styles must go through those variables** — a hard-coded green or a fixed `blur(24px)` silently opts out of Settings → Appearance.

## Conventions

- Tabs for indentation in `desktop-tauri` and `pages`; the eslint config is deliberately relaxed (`no-explicit-any` off, unused vars are warnings with `^_` ignored).
- `packages/docs` and `packages/mcp-debug` are excluded from lint entirely.
- Tests are vitest in a `node` environment, colocated as `*.test.ts` next to the module (both `src/**` and `api/**`).
- `packages/mcp-debug` is a stdio MCP server for poking the local API (`pnpm mcp:debug`, `pnpm mcp:doctor`); `.grok/config.toml` wires it up for Grok/Cursor.
