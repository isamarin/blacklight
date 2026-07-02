import pkg from '../../package.json';
import { getApiOrigin } from '$lib/runtime';

/** CalVer app version from package.json at UI build/dev-server start. */
export const BUILD_VERSION = pkg.version;

let cachedRuntimeVersion: string | null = null;

type HealthResponse = {
	ok?: boolean;
	version?: string;
};

export function getBuildVersion(): string {
	return BUILD_VERSION;
}

export async function fetchAppVersion(options?: { force?: boolean }): Promise<string> {
	if (!options?.force && cachedRuntimeVersion) {
		return cachedRuntimeVersion;
	}

	try {
		const response = await fetch(`${getApiOrigin()}/health`);
		if (response.ok) {
			const body = (await response.json()) as HealthResponse;
			if (typeof body.version === 'string' && body.version.trim()) {
				cachedRuntimeVersion = body.version.trim();
				return cachedRuntimeVersion;
			}
		}
	} catch {
		// Fall back to the UI build version when API is unavailable.
	}

	return BUILD_VERSION;
}