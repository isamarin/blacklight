# Greenlight Desktop (Tauri)

Windows and macOS desktop shell without Electron. Linux is out of scope.

The UI is the same static export as `greenlight-desktop-v3`. A bundled Node sidecar serves the UI and `@greenlight/platform` tRPC on `http://127.0.0.1:9003`. Tauri spawns the sidecar automatically on app start.

## Prerequisites

- Node 22+ and pnpm (already used in the monorepo)
- [Rust](https://rustup.rs/) and platform deps for [Tauri](https://v2.tauri.app/start/prerequisites/) (macOS: Xcode CLT; Windows: VS Build Tools + WebView2)

## Development

From the repository root:

```bash
pnpm install
pnpm build:depsv3
pnpm desktop-tauri run build:renderer   # first time / after UI changes
pnpm desktop-tauri dev                  # spawns sidecar + opens window
```

Sidecar only (browser at http://127.0.0.1:9003/home/):

```bash
pnpm desktop-tauri run sidecar
```

## Production build

```bash
pnpm build:depsv3
pnpm desktop-tauri build
```

This builds the renderer, packages the sidecar binary (`esbuild` + `pkg`), and bundles `.dmg` / `.exe` installers with UI assets under `Resources/app/`.

Artifacts land in `packages/desktop-tauri/src-tauri/target/release/bundle/`.

## Architecture

| Piece | Role |
|---|---|
| `sidecar/server.ts` | Express + tRPC + static `desktop-v3/app` |
| `sidecar/build.mjs` | Bundle sidecar → `src-tauri/binaries/greenlight-sidecar-*` |
| `src-tauri/` | Native window; spawns sidecar with `GREENLIGHT_STATIC_DIR` / `GREENLIGHT_DATA_DIR` |
| `desktop-v3/renderer` | Shared UI (HTTP tRPC) |