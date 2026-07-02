import { execSync } from 'node:child_process';
import { mkdirSync, renameSync, rmSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const root = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.join(root, '..');
const binariesDir = path.join(packageRoot, 'src-tauri', 'binaries');
const distDir = path.join(root, 'dist');
const bundlePath = path.join(distDir, 'blacklight-api.cjs');
const binaryName = 'blacklight-api';

function hostTuple() {
	try {
		return execSync('rustc --print host-tuple', { encoding: 'utf8' }).trim();
	} catch {
		const { arch, platform } = process;
		if (platform === 'darwin') {
			return arch === 'arm64' ? 'aarch64-apple-darwin' : 'x86_64-apple-darwin';
		}
		if (platform === 'win32') {
			return 'x86_64-pc-windows-msvc';
		}
		return arch === 'arm64' ? 'aarch64-unknown-linux-gnu' : 'x86_64-unknown-linux-gnu';
	}
}

mkdirSync(binariesDir, { recursive: true });
mkdirSync(distDir, { recursive: true });

	await esbuild.build({
	entryPoints: [path.join(root, 'server.ts')],
	bundle: true,
	platform: 'node',
	format: 'cjs',
	target: 'node22',
	outfile: bundlePath,
	packages: 'bundle',
	external: ['sharp'],
	sourcemap: false,
	logLevel: 'info'
});

const extension = process.platform === 'win32' ? '.exe' : '';
const unstamped = path.join(binariesDir, `${binaryName}${extension}`);

rmSync(unstamped, { force: true });

function pkgTarget() {
	if (process.platform === 'win32') {
		return 'node22-win-x64';
	}
	if (process.platform === 'darwin') {
		return process.arch === 'arm64' ? 'node22-macos-arm64' : 'node22-macos-x64';
	}
	return process.arch === 'arm64' ? 'node22-linux-arm64' : 'node22-linux-x64';
}

execSync(
	`pnpm exec pkg "${bundlePath}" --targets ${pkgTarget()} --output "${unstamped}" --compress GZip --public-packages sharp`,
	{ stdio: 'inherit', cwd: packageRoot }
);

if (process.platform !== 'win32') {
	chmodSync(unstamped, 0o755);
}

const targetTriple = hostTuple();
const stamped = path.join(binariesDir, `${binaryName}-${targetTriple}${extension}`);

rmSync(stamped, { force: true });
renameSync(unstamped, stamped);

console.log(`[api] built ${stamped}`);