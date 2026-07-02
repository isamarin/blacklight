import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../..')

const DEFAULT_API_PORT = Number(process.env.BLACKLIGHT_PORT ?? 9003)
const DEFAULT_UI_PORT = Number(process.env.BLACKLIGHT_UI_PORT ?? 5173)
const DEFAULT_DATA_DIR = process.env.BLACKLIGHT_DATA_DIR ?? path.join(os.homedir(), '.blacklight')

function apiUrl(port = DEFAULT_API_PORT): string {
  return `http://127.0.0.1:${port}`
}

function uiUrl(port = DEFAULT_UI_PORT): string {
  return `http://localhost:${port}`
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`)
  }
  return (await res.json()) as T
}

async function fetchStatus(url: string): Promise<{ status: number; ok: boolean }> {
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
  return { status: res.status, ok: res.ok }
}

function readJsonFile(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function readApiSettings(dataDir = DEFAULT_DATA_DIR): unknown | undefined {
  const settingsPath = path.join(dataDir, 'sidecar-settings.json')
  if (!fs.existsSync(settingsPath)) return undefined
  return readJsonFile(settingsPath)
}

function listDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).sort()
}

function portInUse(port: number): boolean {
  const res = spawnSync('lsof', ['-i', `:${port}`, '-sTCP:LISTEN', '-t'], { encoding: 'utf8' })
  return res.status === 0 && res.stdout.trim().length > 0
}

function textResult(text: string) {
  return { content: [{ type: 'text' as const, text }] }
}

function jsonResult(data: unknown) {
  return textResult(JSON.stringify(data, null, 2))
}

const server = new McpServer({
  name: 'blacklight-debug',
  version: '0.2.0',
})

server.tool(
  'api_health',
  'Check Blacklight API /health endpoint (minimal tRPC sidecar)',
  { port: z.number().int().min(1).max(65535).optional().describe('API port (default 9003)') },
  async ({ port }) => {
    const p = port ?? DEFAULT_API_PORT
    const data = await fetchJson<{ ok: boolean; service?: string }>(`${apiUrl(p)}/health`)
    return jsonResult({ port: p, listening: portInUse(p), ...data })
  },
)

server.tool(
  'api_status',
  'Read API health, tRPC ping, and persisted settings from the data directory',
  {
    port: z.number().int().min(1).max(65535).optional(),
    data_dir: z.string().optional(),
  },
  async ({ port, data_dir }) => {
    const p = port ?? DEFAULT_API_PORT
    const dir = data_dir ?? DEFAULT_DATA_DIR
    const [health, trpcPing] = await Promise.all([
      fetchJson(`${apiUrl(p)}/health`),
      fetchJson(`${apiUrl(p)}/trpc/ping`),
    ])
    return jsonResult({
      port: p,
      listening: portInUse(p),
      health,
      trpc_ping: trpcPing,
      settings: readApiSettings(dir),
    })
  },
)

server.tool(
  'ui_pages',
  'Check HTTP status for key SvelteKit routes served by Vite (dev) or Tauri webview',
  {
    ui_port: z.number().int().min(1).max(65535).optional().describe('Vite dev server port (default 5173)'),
    routes: z
      .array(z.string())
      .optional()
      .describe('Paths to check, e.g. /home, /settings/home'),
  },
  async ({ ui_port, routes }) => {
    const p = ui_port ?? DEFAULT_UI_PORT
    const paths = routes ?? ['/home', '/settings/home', '/consoles', '/xcloud/library']
    const results = await Promise.all(
      paths.map(async (route) => {
        const url = `${uiUrl(p)}${route.startsWith('/') ? route : `/${route}`}`
        try {
          const result = await fetchStatus(url)
          return { route, ...result }
        } catch (err) {
          return { route, status: 0, ok: false, error: String(err) }
        }
      }),
    )
    return jsonResult({ ui_port: p, pages: results })
  },
)

server.tool(
  'trpc_query',
  'Call a read-only tRPC query on the API (e.g. ping, version)',
  {
    procedure: z.string().describe('Procedure name without /trpc prefix, e.g. ping or version'),
    port: z.number().int().min(1).max(65535).optional(),
  },
  async ({ procedure, port }) => {
    const url = `${apiUrl(port)}/trpc/${procedure}`
    const data = await fetchJson(url)
    return jsonResult({ procedure, url, data })
  },
)

server.tool(
  'read_data_dir',
  'List files in the Blacklight data directory (~/.blacklight by default)',
  {
    data_dir: z.string().optional().describe('Override BLACKLIGHT_DATA_DIR'),
    read_settings: z.boolean().optional().describe('Include parsed sidecar-settings.json'),
  },
  async ({ data_dir, read_settings }) => {
    const dir = data_dir ?? DEFAULT_DATA_DIR
    const files = listDir(dir)
    const payload: Record<string, unknown> = { data_dir: dir, files }
    if (read_settings) {
      payload.settings = readApiSettings(dir)
    }
    return jsonResult(payload)
  },
)

server.tool(
  'run_smoke_test',
  'Run the local desktop-tauri smoke test script (API health, tRPC, Vite routes)',
  {
    port: z.number().int().min(1).max(65535).optional().describe('API port (default 9003)'),
    ui_port: z.number().int().min(1).max(65535).optional().describe('Vite port (default 5173)'),
  },
  async ({ port, ui_port }) => {
    const script = path.join(REPO_ROOT, 'packages/desktop-tauri/scripts/smoke-test-ui.sh')
    if (!fs.existsSync(script)) {
      throw new Error(`Smoke test script not found: ${script}`)
    }
    const env = {
      ...process.env,
      BLACKLIGHT_PORT: String(port ?? DEFAULT_API_PORT),
      BLACKLIGHT_UI_PORT: String(ui_port ?? DEFAULT_UI_PORT),
    }
    const result = spawnSync('bash', [script], {
      cwd: REPO_ROOT,
      env,
      encoding: 'utf8',
      timeout: 30_000,
    })
    return jsonResult({
      exit_code: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
    })
  },
)

server.tool(
  'debug_summary',
  'One-shot local debug snapshot: API port, health, settings, tRPC ping, key UI pages',
  {
    port: z.number().int().min(1).max(65535).optional(),
    ui_port: z.number().int().min(1).max(65535).optional(),
  },
  async ({ port, ui_port }) => {
    const apiPort = port ?? DEFAULT_API_PORT
    const vitePort = ui_port ?? DEFAULT_UI_PORT
    const summary: Record<string, unknown> = {
      api_port: apiPort,
      ui_port: vitePort,
      api_listening: portInUse(apiPort),
      ui_listening: portInUse(vitePort),
      data_dir: DEFAULT_DATA_DIR,
      data_files: listDir(DEFAULT_DATA_DIR),
      settings: readApiSettings(),
    }

    try {
      summary.health = await fetchJson(`${apiUrl(apiPort)}/health`)
      summary.trpc_ping = await fetchJson(`${apiUrl(apiPort)}/trpc/ping`)
    } catch (err) {
      summary.api_error = String(err)
    }

    try {
      const routes = ['/home', '/settings/home']
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
  },
)

async function selfTest(): Promise<void> {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  process.stderr.write('[blacklight-debug] MCP server ready on stdio\n')
}

if (process.argv.includes('--self-test')) {
  await selfTest()
  setTimeout(() => process.exit(0), 500)
} else {
  const transport = new StdioServerTransport()
  await server.connect(transport)
}