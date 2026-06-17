import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const nextBin = join(
  packageRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'next.CMD' : 'next',
)

const result = spawnSync(nextBin, ['build'], {
  cwd: join(packageRoot, 'renderer'),
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit',
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}