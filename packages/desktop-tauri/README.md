# Blacklight Desktop (Tauri)

Desktop shell for Blacklight on Windows and macOS.

- **UI:** SvelteKit 2 + Svelte 5 (SPA, `ssr = false`)
- **Shell:** Tauri 2
- **Backend:** Minimal `blacklight-api` sidecar (tRPC only)

## Development

From the repo root:

```bash
pnpm install
pnpm build:depsv3
pnpm desktop-tauri tauri:dev
```

This starts Vite on `http://localhost:5173` and opens the Tauri window. The API process is spawned automatically when **autostart** is enabled in Settings → Web UI (default: off).

### API only (browser dev)

```bash
pnpm desktop-tauri api          # run API on port 9003
pnpm desktop-tauri dev          # Vite only, no Tauri shell
```

### Smoke test

With Vite and the API running:

```bash
bash packages/desktop-tauri/scripts/smoke-test-ui.sh
```

## Production build

```bash
pnpm build:depsv3
pnpm desktop-tauri tauri:build
```

`tauri:build` runs `vite build`, bundles `blacklight-api` via `build:api`, then packages DMG (macOS) or NSIS (Windows).

Binaries are written to `src-tauri/binaries/blacklight-api-<target-triple>` (gitignored; built locally/CI).

## Project layout

| Path | Purpose |
|------|---------|
| `src/routes/` | SvelteKit pages |
| `src/lib/` | Stores, tRPC client, Tauri invoke helpers |
| `api/` | Minimal Node HTTP server (`/health`, `/trpc`) |
| `src-tauri/` | Rust shell, settings persistence, API spawn |

## Settings

- **App settings** (streaming, input, video, language): `app_data_dir/app-settings.json` via Tauri commands
- **API settings** (`webui_autostart`, `webui_port`): `app_data_dir/sidecar-settings.json` via Tauri commands
- **Browser-only dev** (`pnpm dev` without Tauri): falls back to `localStorage`
- On first Tauri launch, existing `localStorage` settings are migrated into `app-settings.json`