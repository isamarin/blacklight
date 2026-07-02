# Legacy renderer (deprecated)

Next.js renderer kept for reference only. **Blacklight desktop** is `packages/desktop-tauri` (Tauri + SvelteKit).

From the repository root:

```bash
pnpm install
pnpm build:deps
pnpm desktop-tauri tauri:dev
```

Renderer-only (no Tauri shell):

```bash
pnpm desktop-renderer dev:renderer
```