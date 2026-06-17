# Greenlight Desktop (Tauri)

Windows and macOS desktop shell without Electron. Linux is out of scope.

The UI is the same static export as `greenlight-desktop-v3`. A local Node sidecar serves the UI and `@greenlight/platform` tRPC on `http://127.0.0.1:9003`.

## Prerequisites

- Node 22+ and pnpm (already used in the monorepo)
- [Rust](https://rustup.rs/) and platform deps for [Tauri](https://v2.tauri.app/start/prerequisites/) (macOS: Xcode CLT; Windows: VS Build Tools + WebView2)

## Development

From the repository root:

```bash
pnpm install
pnpm build:depsv3
pnpm desktop-tauri run build:renderer   # first time / after UI changes
pnpm desktop-tauri dev                  # sidecar + tauri dev window
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

Artifacts land in `packages/desktop-tauri/src-tauri/target/release/bundle/`.

Generate proper `.ico` / `.icns` once:

```bash
cd packages/desktop-tauri
pnpm tauri icon src-tauri/icons/icon.png
```

## Architecture

| Piece | Role |
|---|---|
| `sidecar/server.ts` | Express + tRPC + static `desktop-v3/app` |
| `src-tauri/` | Native window (Tauri 2) |
| `desktop-v3/renderer` | Shared UI (HTTP tRPC in Tauri mode) |

Electron V3 remains available via `pnpm desktopv3 dev` until feature parity and CI cutover.