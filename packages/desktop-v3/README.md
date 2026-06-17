# Blacklight Desktop UI

Next.js renderer and web build for Blacklight. Bundled into the Tauri desktop shell (`packages/desktop-tauri`).

**Maintainer:** Igor Samarin ([@isamarin](https://github.com/isamarin)) — mako.mmw@gmail.com

## Development

From the repository root:

```bash
pnpm install
pnpm build:depsv3
pnpm desktop-tauri dev
```

Renderer only (without Tauri shell):

```bash
pnpm desktopv3 dev:renderer
```

From this package directory:

```bash
pnpm dev
```

## Web build

```bash
pnpm build:web
```