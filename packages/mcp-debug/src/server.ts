/**
 * Blacklight Debug MCP Server (stdio)
 *
 * Local diagnostics for desktop-tauri: API health, tRPC, UI routes,
 * app data dirs, auth token presence (redacted), smoke scripts.
 *
 * Env:
 *   BLACKLIGHT_PORT      default 9003
 *   BLACKLIGHT_UI_PORT   default 4173 (Tauri preview); use 5173 for `pnpm dev`
 *   BLACKLIGHT_DATA_DIR  optional override for legacy ~/.blacklight
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')
const PKG_VERSION = '0.3.0'

const DEFAULT_API_PORT = Number(process.env.BLACKLIGHT_PORT ?? 9003)
const DEFAULT_UI_PORT = Number(process.env.BLACKLIGHT_UI_PORT ?? 4173)
const LEGACY_DATA_DIR =
  process.env.BLACKLIGHT_DATA_DIR ?? path.join(os.homedir(), '.blacklight')

const TAURI_DATA_DIR = (() => {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library/Application Support/com.isamarin.blacklight')
  }
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA ?? path.join(os.homedir(), 'AppData/Roaming')
    return path.join(appData, 'com.isamarin.blacklight')
  }
  return path.join(os.homedir(), '.local/share/com.isamarin.blacklight')
})()

/** Known tRPC procedures from @blacklight/platform (read-only notes for agents). */
const TRPC_PROCEDURES: Array<{ name: string; kind: 'query' | 'mutation'; notes: string }> = [
  { name: 'ping', kind: 'query', notes: 'Returns "pong"' },
  { name: 'version', kind: 'query', notes: 'Platform package version' },
  { name: 'echo', kind: 'query', notes: 'Echo string input' },
  { name: 'auth_msal_start', kind: 'query', notes: 'Start device-code MSAL flow' },
  { name: 'auth_msal_verify', kind: 'query', notes: 'Verify device code' },
  { name: 'auth_msal_refresh', kind: 'query', notes: 'Refresh user token' },
  { name: 'auth_get_streamingtokens', kind: 'query', notes: 'xHome / xCloud streaming tokens' },
  { name: 'auth_get_webtoken', kind: 'query', notes: 'Web token for profile/smartglass' },
  { name: 'profile_get_current', kind: 'query', notes: 'Current Xbox profile' },
  { name: 'profile_get_friends', kind: 'query', notes: 'Friends list' },
  { name: 'profile_get_played_games', kind: 'query', notes: 'Recently played + achievements' },
  { name: 'smartglass_consoles_list', kind: 'query', notes: 'Home consoles' },
  { name: 'smartglass_console_power_on', kind: 'mutation', notes: 'Power on console' },
  { name: 'gamepass_get_titles', kind: 'query', notes: 'xCloud title catalog' },
  { name: 'gamepass_get_recent_titles', kind: 'query', notes: 'Recent xCloud titles' },
  { name: 'gamepass_get_new_titles', kind: 'query', notes: 'New xCloud titles' },
  { name: 'gamepass_batch_productids', kind: 'query', notes: 'Resolve product IDs' },
  { name: 'gamepass_resolve_productid', kind: 'query', notes: 'Resolve one product ID' },
  { name: 'streaming_start_stream', kind: 'mutation', notes: 'Start stream session' },
  { name: 'streaming_get_status', kind: 'mutation', notes: 'Stream session status' },
  { name: 'streaming_get_waiting_times', kind: 'mutation', notes: 'Queue waiting times' },
  { name: 'streaming_send_sdp_offer', kind: 'mutation', notes: 'WebRTC SDP offer' },
  { name: 'streaming_send_chat_sdp_offer', kind: 'mutation', notes: 'Chat SDP offer' },
  { name: 'streaming_send_ice_candidates', kind: 'mutation', notes: 'ICE candidates' },
  { name: 'streaming_send_msal_token', kind: 'mutation', notes: 'MSAL token for stream' },
  { name: 'streaming_send_keepalive', kind: 'mutation', notes: 'Stream keepalive' },
]

const DEFAULT_UI_ROUTES = [
  '/',
  '/home',
  '/consoles',
  '/xcloud/library',
  '/profile',
  '/settings/home',
  '/settings/streaming',
  '/settings/input',
  '/settings/video',
  '/settings/webui',
  '/settings/debug',
]

const SECRET_KEY_RE =
  /token|secret|password|passwd|authorization|cookie|refresh|access_token|id_token|bearer/i

function apiUrl(port = DEFAULT_API_PORT): string {
  return `http://127.0.0.1:${port}`
}

function uiUrl(port = DEFAULT_UI_PORT): string {
  return `http://127.0.0.1:${port}`
}

function textResult(text: string) {
  return { content: [{ type: 'text' as const, text }] }
}

function jsonResult(data: unknown) {
  return textResult(JSON.stringify(data, null, 2))
}

function errorResult(err: unknown) {
  const message = err instanceof Error ? err.message : String(err)
  return textResult(JSON.stringify({ ok: false, error: message }, null, 2))
}

async function fetchJson<T>(url: string, timeoutMs = 5000): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status} for ${url}${body ? `: ${body.slice(0, 200)}` : ''}`)
  }
  return (await res.json()) as T
}

async function fetchStatus(url: string): Promise<{ status: number; ok: boolean; ms: number }> {
  const started = Date.now()
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
  return { status: res.status, ok: res.ok, ms: Date.now() - started }
}

function readJsonFile(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function listDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).sort()
}

function dirExists(dir: string): boolean {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory()
  } catch {
    return false
  }
}

function fileMeta(filePath: string): { path: string; exists: boolean; size?: number; mtime?: string } {
  if (!fs.existsSync(filePath)) return { path: filePath, exists: false }
  const st = fs.statSync(filePath)
  return {
    path: filePath,
    exists: true,
    size: st.size,
    mtime: st.mtime.toISOString(),
  }
}

function portListeners(port: number): string[] {
  const res = spawnSync('lsof', ['-i', `:${port}`, '-sTCP:LISTEN', '-n', '-P'], {
    encoding: 'utf8',
  })
  if (res.status !== 0 || !res.stdout.trim()) return []
  return res.stdout
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
}

function portInUse(port: number): boolean {
  return portListeners(port).length > 0
}

function redactValue(key: string, value: unknown): unknown {
  if (SECRET_KEY_RE.test(key)) {
    if (typeof value === 'string') {
      return value.length === 0 ? '[empty]' : `[redacted len=${value.length}]`
    }
    return '[redacted]'
  }
  if (Array.isArray(value)) {
    return value.map((item, i) => redactValue(String(i), item))
  }
  if (value && typeof value === 'object') {
    return redactObject(value as Record<string, unknown>)
  }
  return value
}

function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    out[key] = redactValue(key, value)
  }
  return out
}

function resolveDataDirs(override?: string): { primary: string; candidates: string[] } {
  const candidates = [...new Set([override, TAURI_DATA_DIR, LEGACY_DATA_DIR].filter(Boolean) as string[])]
  const primary = candidates.find((d) => dirExists(d)) ?? candidates[0]!
  return { primary, candidates }
}

function readSettingsFile(dataDir: string, name: string): unknown | undefined {
  const filePath = path.join(dataDir, name)
  if (!fs.existsSync(filePath)) return undefined
  try {
    return readJsonFile(filePath)
  } catch (err) {
    return { error: String(err) }
  }
}

function authStatusFromDir(dataDir: string): Record<string, unknown> {
  const tokenPath = path.join(dataDir, 'user-token.json')
  const meta = fileMeta(tokenPath)
  if (!meta.exists) {
    return { data_dir: dataDir, authenticated: false, user_token: meta }
  }
  try {
    const raw = readJsonFile(tokenPath) as Record<string, unknown>
    const expiresOn = typeof raw.expires_on === 'string' ? raw.expires_on : undefined
    let expired: boolean | undefined
    if (expiresOn) {
      const t = Date.parse(expiresOn)
      if (!Number.isNaN(t)) expired = t <= Date.now()
    }
    return {
      data_dir: dataDir,
      authenticated: true,
      user_token: meta,
      token_type: raw.token_type,
      scope: raw.scope,
      expires_on: expiresOn,
      expires_in: raw.expires_in,
      expired,
      has_access_token: typeof raw.access_token === 'string' && raw.access_token.length > 0,
      has_refresh_token: typeof raw.refresh_token === 'string' && raw.refresh_token.length > 0,
      has_id_token: typeof raw.id_token === 'string' && raw.id_token.length > 0,
      // Never return raw secrets
      redacted_preview: redactObject(raw),
    }
  } catch (err) {
    return { data_dir: dataDir, authenticated: false, user_token: meta, error: String(err) }
  }
}

function imageCacheStats(dataDir: string): Record<string, unknown> {
  const cacheDir = path.join(dataDir, 'image-cache')
  if (!dirExists(cacheDir)) {
    return { path: cacheDir, exists: false, files: 0, bytes: 0 }
  }
  let files = 0
  let bytes = 0
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name)
      const st = fs.statSync(full)
      if (st.isDirectory()) walk(full)
      else {
        files += 1
        bytes += st.size
      }
    }
  }
  walk(cacheDir)
  return { path: cacheDir, exists: true, files, bytes }
}

function blacklightProcesses(): Array<Record<string, string>> {
  const res = spawnSync('ps', ['-ax', '-o', 'pid=,ppid=,command='], { encoding: 'utf8' })
  if (res.status !== 0 || !res.stdout) return []
  const needles = ['blacklight', 'desktop-tauri', 'blacklight-api']
  return res.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => needles.some((n) => line.toLowerCase().includes(n)))
    .filter((line) => !line.includes('mcp-debug'))
    .slice(0, 40)
    .map((line) => {
      const m = line.match(/^(\d+)\s+(\d+)\s+(.*)$/)
      if (!m) return { raw: line }
      return { pid: m[1]!, ppid: m[2]!, command: m[3]! }
    })
}

function runBashScript(
  scriptRel: string,
  env: Record<string, string>,
  timeoutMs = 30_000,
): Record<string, unknown> {
  const script = path.join(REPO_ROOT, scriptRel)
  if (!fs.existsSync(script)) {
    throw new Error(`Script not found: ${script}`)
  }
  const result = spawnSync('bash', [script], {
    cwd: REPO_ROOT,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    timeout: timeoutMs,
  })
  return {
    script: scriptRel,
    exit_code: result.status,
    signal: result.signal,
    stdout: result.stdout,
    stderr: result.stderr,
  }
}

function buildTrpcUrl(procedure: string, port?: number, input?: unknown): string {
  const base = `${apiUrl(port)}/trpc/${procedure.replace(/^\//, '')}`
  // Standalone tRPC HTTP adapter accepts plain GET without batch for simple queries
  if (input === undefined) return base
  const encoded = encodeURIComponent(JSON.stringify(input))
  return `${base}?input=${encoded}`
}

const server = new McpServer({
  name: 'blacklight-debug',
  version: PKG_VERSION,
})

// ── tools ──────────────────────────────────────────────────────────────

server.tool(
  'debug_summary',
  'One-shot local debug snapshot: ports, API health, settings, auth presence, key UI pages, processes',
  {
    port: z.number().int().min(1).max(65535).optional(),
    ui_port: z.number().int().min(1).max(65535).optional(),
  },
  async ({ port, ui_port }) => {
    try {
      const apiPort = port ?? DEFAULT_API_PORT
      const vitePort = ui_port ?? DEFAULT_UI_PORT
      const { primary, candidates } = resolveDataDirs()
      const summary: Record<string, unknown> = {
        mcp_version: PKG_VERSION,
        api_port: apiPort,
        ui_port: vitePort,
        api_listening: portInUse(apiPort),
        ui_listening: portInUse(vitePort),
        api_listeners: portListeners(apiPort),
        ui_listeners: portListeners(vitePort),
        data_dirs: candidates.map((d) => ({ path: d, exists: dirExists(d), files: listDir(d) })),
        primary_data_dir: primary,
        app_settings: readSettingsFile(primary, 'app-settings.json'),
        sidecar_settings: readSettingsFile(primary, 'sidecar-settings.json'),
        auth: authStatusFromDir(primary),
        image_cache: imageCacheStats(primary),
        processes: blacklightProcesses(),
      }

      try {
        summary.health = await fetchJson(`${apiUrl(apiPort)}/health`)
        summary.trpc_ping = await fetchJson(`${apiUrl(apiPort)}/trpc/ping`)
        summary.trpc_version = await fetchJson(`${apiUrl(apiPort)}/trpc/version`)
      } catch (err) {
        summary.api_error = String(err)
      }

      try {
        const routes = ['/home', '/settings/home', '/xcloud/library']
        summary.ui_pages = await Promise.all(
          routes.map(async (route) => {
            const url = `${uiUrl(vitePort)}${route}`
            try {
              return { route, ...(await fetchStatus(url)) }
            } catch (err) {
              return { route, status: 0, ok: false, error: String(err) }
            }
          }),
        )
      } catch (err) {
        summary.ui_error = String(err)
      }

      return jsonResult(summary)
    } catch (err) {
      return errorResult(err)
    }
  },
)

server.tool(
  'api_health',
  'Check Blacklight API /health endpoint (minimal tRPC sidecar)',
  { port: z.number().int().min(1).max(65535).optional().describe('API port (default 9003)') },
  async ({ port }) => {
    try {
      const p = port ?? DEFAULT_API_PORT
      const data = await fetchJson<Record<string, unknown>>(`${apiUrl(p)}/health`)
      return jsonResult({ port: p, listening: portInUse(p), listeners: portListeners(p), ...data })
    } catch (err) {
      return errorResult(err)
    }
  },
)

server.tool(
  'api_status',
  'Read API health, tRPC ping/version, and persisted settings from data directories',
  {
    port: z.number().int().min(1).max(65535).optional(),
    data_dir: z.string().optional(),
  },
  async ({ port, data_dir }) => {
    try {
      const p = port ?? DEFAULT_API_PORT
      const { primary, candidates } = resolveDataDirs(data_dir)
      const [health, trpcPing, trpcVersion] = await Promise.all([
        fetchJson(`${apiUrl(p)}/health`),
        fetchJson(`${apiUrl(p)}/trpc/ping`),
        fetchJson(`${apiUrl(p)}/trpc/version`).catch((e) => ({ error: String(e) })),
      ])
      return jsonResult({
        port: p,
        listening: portInUse(p),
        health,
        trpc_ping: trpcPing,
        trpc_version: trpcVersion,
        primary_data_dir: primary,
        data_dirs: candidates.map((d) => ({
          path: d,
          exists: dirExists(d),
          files: listDir(d),
          sidecar_settings: readSettingsFile(d, 'sidecar-settings.json'),
        })),
      })
    } catch (err) {
      return errorResult(err)
    }
  },
)

server.tool(
  'api_version',
  'Read API /health.version and tRPC version procedure',
  { port: z.number().int().min(1).max(65535).optional() },
  async ({ port }) => {
    try {
      const p = port ?? DEFAULT_API_PORT
      const [health, version] = await Promise.all([
        fetchJson(`${apiUrl(p)}/health`),
        fetchJson(`${apiUrl(p)}/trpc/version`),
      ])
      return jsonResult({ port: p, health, trpc_version: version })
    } catch (err) {
      return errorResult(err)
    }
  },
)

server.tool(
  'media_probe',
  'Probe API /media endpoint (image cache handler). Expects 400/405 without params — proves route is registered',
  { port: z.number().int().min(1).max(65535).optional() },
  async ({ port }) => {
    try {
      const p = port ?? DEFAULT_API_PORT
      const url = `${apiUrl(p)}/media`
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      const body = await res.text().catch(() => '')
      return jsonResult({
        port: p,
        url,
        status: res.status,
        // Registered media handler should not be plain 404 from catch-all
        registered: res.status !== 404,
        body_preview: body.slice(0, 200),
      })
    } catch (err) {
      return errorResult(err)
    }
  },
)

server.tool(
  'ui_pages',
  'Check HTTP status for key SvelteKit routes (Vite preview 4173 or dev 5173)',
  {
    ui_port: z.number().int().min(1).max(65535).optional().describe('UI port (default 4173 Tauri preview)'),
    routes: z.array(z.string()).optional().describe('Paths to check, e.g. /home, /settings/home'),
  },
  async ({ ui_port, routes }) => {
    try {
      const p = ui_port ?? DEFAULT_UI_PORT
      const paths = routes ?? DEFAULT_UI_ROUTES
      const results = await Promise.all(
        paths.map(async (route) => {
          const url = `${uiUrl(p)}${route.startsWith('/') ? route : `/${route}`}`
          try {
            return { route, ...(await fetchStatus(url)) }
          } catch (err) {
            return { route, status: 0, ok: false, error: String(err) }
          }
        }),
      )
      return jsonResult({
        ui_port: p,
        listening: portInUse(p),
        listeners: portListeners(p),
        pages: results,
      })
    } catch (err) {
      return errorResult(err)
    }
  },
)

server.tool(
  'list_routes',
  'List known Blacklight desktop-tauri UI routes agents typically smoke-test',
  {},
  async () => jsonResult({ routes: DEFAULT_UI_ROUTES }),
)

server.tool(
  'list_procedures',
  'List known tRPC procedures on blacklight-api (@blacklight/platform router)',
  {
    kind: z.enum(['query', 'mutation', 'all']).optional().describe('Filter by procedure kind'),
  },
  async ({ kind }) => {
    const filter = kind ?? 'all'
    const procedures =
      filter === 'all' ? TRPC_PROCEDURES : TRPC_PROCEDURES.filter((p) => p.kind === filter)
    return jsonResult({ count: procedures.length, filter, procedures })
  },
)

server.tool(
  'trpc_query',
  'Call a read-only tRPC query on the API (e.g. ping, version). Avoid auth procedures that start live Xbox flows unless intentional',
  {
    procedure: z.string().describe('Procedure name without /trpc prefix, e.g. ping or version'),
    port: z.number().int().min(1).max(65535).optional(),
    input: z
      .unknown()
      .optional()
      .describe('Optional JSON input for the procedure (GET ?input=)'),
  },
  async ({ procedure, port, input }) => {
    try {
      if (procedure.includes('streaming_') || procedure.includes('power_on')) {
        return errorResult(
          `Refusing procedure "${procedure}" via trpc_query — use explicit product flows; mutations can affect live sessions`,
        )
      }
      const url = buildTrpcUrl(procedure, port, input)
      const data = await fetchJson(url)
      return jsonResult({ procedure, url, data })
    } catch (err) {
      return errorResult(err)
    }
  },
)

server.tool(
  'port_status',
  'Show which processes listen on Blacklight API/UI ports (and optional extra ports)',
  {
    ports: z
      .array(z.number().int().min(1).max(65535))
      .optional()
      .describe('Ports to inspect (default: API + UI + 5173 + 9003)'),
  },
  async ({ ports }) => {
    const list = ports ?? [
      DEFAULT_API_PORT,
      DEFAULT_UI_PORT,
      5173,
      9003,
      4173,
    ]
    const unique = [...new Set(list)]
    return jsonResult({
      ports: unique.map((p) => ({
        port: p,
        listening: portInUse(p),
        listeners: portListeners(p),
      })),
    })
  },
)

server.tool(
  'process_list',
  'List running processes whose command line mentions blacklight / desktop-tauri / blacklight-api',
  {},
  async () => jsonResult({ processes: blacklightProcesses() }),
)

server.tool(
  'read_data_dir',
  'List files in Blacklight data directories (Tauri Application Support + optional ~/.blacklight)',
  {
    data_dir: z.string().optional().describe('Override data dir (checked first)'),
    read_settings: z.boolean().optional().describe('Include parsed settings JSON'),
  },
  async ({ data_dir, read_settings }) => {
    const { primary, candidates } = resolveDataDirs(data_dir)
    const dirs = candidates.map((dir) => {
      const entry: Record<string, unknown> = {
        path: dir,
        exists: dirExists(dir),
        files: listDir(dir).map((name) => fileMeta(path.join(dir, name))),
        image_cache: imageCacheStats(dir),
      }
      if (read_settings) {
        entry.app_settings = readSettingsFile(dir, 'app-settings.json')
        entry.sidecar_settings = readSettingsFile(dir, 'sidecar-settings.json')
      }
      return entry
    })
    return jsonResult({ primary_data_dir: primary, dirs })
  },
)

server.tool(
  'read_app_settings',
  'Read app-settings.json and sidecar-settings.json from the active data directory (no secrets)',
  {
    data_dir: z.string().optional(),
  },
  async ({ data_dir }) => {
    const { primary, candidates } = resolveDataDirs(data_dir)
    return jsonResult({
      primary_data_dir: primary,
      candidates,
      app_settings: readSettingsFile(primary, 'app-settings.json'),
      sidecar_settings: readSettingsFile(primary, 'sidecar-settings.json'),
      files: {
        app_settings: fileMeta(path.join(primary, 'app-settings.json')),
        sidecar_settings: fileMeta(path.join(primary, 'sidecar-settings.json')),
        user_token: fileMeta(path.join(primary, 'user-token.json')),
      },
    })
  },
)

server.tool(
  'auth_status',
  'Check whether a user token is stored. Secrets (access/refresh/id tokens) are always redacted',
  {
    data_dir: z.string().optional(),
  },
  async ({ data_dir }) => {
    const { primary, candidates } = resolveDataDirs(data_dir)
    return jsonResult({
      primary_data_dir: primary,
      statuses: candidates.map((d) => authStatusFromDir(d)),
    })
  },
)

server.tool(
  'image_cache_stats',
  'Count files and total bytes in the API image-cache directory',
  {
    data_dir: z.string().optional(),
  },
  async ({ data_dir }) => {
    const { primary, candidates } = resolveDataDirs(data_dir)
    return jsonResult({
      primary_data_dir: primary,
      caches: candidates.map((d) => imageCacheStats(d)),
    })
  },
)

server.tool(
  'run_smoke_test',
  'Run packages/desktop-tauri/scripts/smoke-test-ui.sh (API health, tRPC ping, Vite routes)',
  {
    port: z.number().int().min(1).max(65535).optional().describe('API port (default 9003)'),
    ui_port: z.number().int().min(1).max(65535).optional().describe('UI port (default 4173)'),
  },
  async ({ port, ui_port }) => {
    try {
      const result = runBashScript('packages/desktop-tauri/scripts/smoke-test-ui.sh', {
        BLACKLIGHT_PORT: String(port ?? DEFAULT_API_PORT),
        BLACKLIGHT_UI_PORT: String(ui_port ?? DEFAULT_UI_PORT),
      })
      return jsonResult(result)
    } catch (err) {
      return errorResult(err)
    }
  },
)

server.tool(
  'run_smoke_p0',
  'Run packages/desktop-tauri/scripts/smoke-test-p0.sh (health, ping, auth_msal_start registration, core routes)',
  {
    port: z.number().int().min(1).max(65535).optional(),
    ui_port: z.number().int().min(1).max(65535).optional(),
  },
  async ({ port, ui_port }) => {
    try {
      const result = runBashScript('packages/desktop-tauri/scripts/smoke-test-p0.sh', {
        BLACKLIGHT_PORT: String(port ?? DEFAULT_API_PORT),
        BLACKLIGHT_UI_PORT: String(ui_port ?? DEFAULT_UI_PORT),
      })
      return jsonResult(result)
    } catch (err) {
      return errorResult(err)
    }
  },
)

server.tool(
  'repo_paths',
  'Resolve important Blacklight monorepo paths for agents',
  {},
  async () =>
    jsonResult({
      repo_root: REPO_ROOT,
      mcp_package: path.join(REPO_ROOT, 'packages/mcp-debug'),
      desktop_tauri: path.join(REPO_ROOT, 'packages/desktop-tauri'),
      api_server: path.join(REPO_ROOT, 'packages/desktop-tauri/api/server.ts'),
      tauri_data_dir: TAURI_DATA_DIR,
      legacy_data_dir: LEGACY_DATA_DIR,
      default_api_port: DEFAULT_API_PORT,
      default_ui_port: DEFAULT_UI_PORT,
    }),
)

// ── boot ───────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  process.stderr.write(`[blacklight-debug] MCP server v${PKG_VERSION} ready on stdio\n`)
}

if (process.argv.includes('--self-test')) {
  await main()
  setTimeout(() => process.exit(0), 400)
} else {
  await main()
}
