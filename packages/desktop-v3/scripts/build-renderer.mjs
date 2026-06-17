import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const nextCli = join(packageRoot, 'node_modules', 'next', 'dist', 'bin', 'next')

const result = spawnSync(process.execPath, [nextCli, 'build'], {
  cwd: join(packageRoot, 'renderer'),
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit',
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}