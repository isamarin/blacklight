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

const DEFAULT_PORT = Number(process.env.BLACKLIGHT_PORT ?? 9003)
const DEFAULT_DATA_DIR = process.env.BLACKLIGHT_DATA_DIR ?? path.join(os.homedir(), '.blacklight')

function baseUrl(port = DEFAULT_PORT): string {
  return `http://127.0.0.1:${port}`
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
  version: '0.1.0',
})

server.tool(
  'sidecar_health',
  'Check Blacklight sidecar /health endpoint',
  { port: z.number().int().min(1).max(65535).optional().describe('Sidecar port (default 9003)') },
  async ({ port }) => {
    const data = await fetchJson<{ ok: boolean; running: boolean }>(`${baseUrl(port)}/health`)
    return jsonResult({ port: port ?? DEFAULT_PORT, ...data })
  },
)

server.tool(
  'sidecar_status',
  'Read sidecar web UI status and settings',
  { port: z.number().int().min(1).max(65535).optional() },
  async ({ port }) => {
    const p = port ?? DEFAULT_PORT
    const [status, settings] = await Promise.all([
      fetchJson(`${baseUrl(p)}/api/webui/status`),
      fetchJson(`${baseUrl(p)}/api/webui/settings`),
    ])
    return jsonResult({ port: p, status, settings, listening: portInUse(p) })
  },
)

server.tool(
  'sidecar_pages',
  'Check HTTP status for key UI routes served by the sidecar',
  {
    port: z.number().int().min(1).max(65535).optional(),
    routes: z
      .array(z.string())
      .optional()
      .describe('Paths to check, e.g. /home/, /settings/, /consoles/'),
  },
  async ({ port, routes }) => {
    const p = port ?? DEFAULT_PORT
    const paths = routes ?? ['/home/', '/settings/', '/consoles/', '/auth/home/', '/profile/']
    const results = await Promise.all(
      paths.map(async (route) => {
        const url = `${baseUrl(p)}${route.startsWith('/') ? route : `/${route}`}`
        try {
          const result = await fetchStatus(url)
          return { route, ...result }
        } catch (err) {
          return { route, status: 0, ok: false, error: String(err) }
        }
      }),
    )
    return jsonResult({ port: p, pages: results })
  },
)

server.tool(
  'trpc_query',
  'Call a read-only tRPC query on the sidecar (e.g. ping, version)',
  {
    procedure: z.string().describe('Procedure name without /trpc prefix, e.g. ping or version'),
    port: z.number().int().min(1).max(65535).optional(),
  },
  async ({ procedure, port }) => {
    const url = `${baseUrl(port)}/trpc/${procedure}`
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
    const settingsPath = path.join(dir, 'sidecar-settings.json')
    if (read_settings && fs.existsSync(settingsPath)) {
      payload.settings = readJsonFile(settingsPath)
    }
    return jsonResult(payload)
  },
)

server.tool(
  'run_smoke_test',
  'Run the local sidecar smoke test script (health, pages, tRPC)',
  {
    port: z.number().int().min(1).max(65535).optional().describe('Ephemeral port for isolated test'),
  },
  async ({ port }) => {
    const script = path.join(REPO_ROOT, 'packages/desktop-tauri/scripts/smoke-test-sidecar.sh')
    if (!fs.existsSync(script)) {
      throw new Error(`Smoke test script not found: ${script}`)
    }
    const env = { ...process.env, BLACKLIGHT_PORT: String(port ?? 19004) }
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
  'One-shot local debug snapshot: port, health, settings, key pages, data dir',
  { port: z.number().int().min(1).max(65535).optional() },
  async ({ port }) => {
    const p = port ?? DEFAULT_PORT
    const summary: Record<string, unknown> = {
      port: p,
      listening: portInUse(p),
      data_dir: DEFAULT_DATA_DIR,
      data_files: listDir(DEFAULT_DATA_DIR),
    }

    try {
      summary.health = await fetchJson(`${baseUrl(p)}/health`)
      summary.settings = await fetchJson(`${baseUrl(p)}/api/webui/settings`)
      summary.trpc_ping = await fetchJson(`${baseUrl(p)}/trpc/ping`)
    } catch (err) {
      summary.sidecar_error = String(err)
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