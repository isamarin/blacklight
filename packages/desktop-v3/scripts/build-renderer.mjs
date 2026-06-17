import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(join(packageRoot, 'renderer'))
process.env.NODE_ENV = 'production'
execSync('pnpm exec next build', { stdio: 'inherit' })