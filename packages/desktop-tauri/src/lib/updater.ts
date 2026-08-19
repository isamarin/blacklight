import { compare } from 'compare-versions';
import { isTauriApp, openExternal } from '$lib/runtime';
import { getAppInfo } from '$lib/tauri';

export const GITHUB_REPO = 'isamarin/blacklight';
const DISMISSED_UPDATE_KEY = 'blacklight-dismissed-update';

export interface GithubRelease {
	tag_name: string;
	body: string;
	html_url: string;
	prerelease: boolean;
	draft: boolean;
}

export type UpdateCheckStatus = 'update-available' | 'up-to-date' | 'skipped' | 'error';

export interface UpdateCheckResult {
	status: UpdateCheckStatus;
	currentVersion?: string;
	release?: GithubRelease;
	error?: string;
}

export function normalizeVersion(version: string): string {
	return version.trim().replace(/^v/i, '');
}

/**
 * Map short-year CalVer (26.8.9) onto 20YY.M.N so leftover v2026.* tags
 * compare as the same calendar family instead of 2026 > 26.
 */
export function canonicalVersion(version: string): string {
	const normalized = normalizeVersion(version);
	const match = /^(\d+)\.(.+)$/.exec(normalized);
	if (!match) return normalized;

	const year = match[1];
	if (year.length === 2) {
		return `20${year}.${match[2]}`;
	}
	return normalized;
}

function isHigherVersion(left: string, right: string): boolean {
	try {
		return compare(canonicalVersion(left), canonicalVersion(right), '>');
	} catch {
		return false;
	}
}

export function pickLatestRelease(
	releases: GithubRelease[],
	prereleases: boolean
): GithubRelease | null {
	const candidates = releases.filter((release) => !release.draft && release.prerelease === prereleases);
	if (candidates.length === 0) return null;

	return candidates.reduce((best, release) =>
		isHigherVersion(release.tag_name, best.tag_name) ? release : best
	);
}

export function isNewerRelease(currentVersion: string, releaseTag: string): boolean {
	return isHigherVersion(releaseTag, currentVersion);
}

export function isUpdateDismissed(tagName: string): boolean {
	if (typeof localStorage === 'undefined') return false;
	return localStorage.getItem(DISMISSED_UPDATE_KEY) === tagName;
}

export function dismissUpdate(tagName: string): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(DISMISSED_UPDATE_KEY, tagName);
}

export async function fetchLatestGithubRelease(
	repository = GITHUB_REPO,
	prereleases = false
): Promise<GithubRelease | null> {
	const response = await fetch(`https://api.github.com/repos/${repository}/releases`, {
		headers: {
			Accept: 'application/vnd.github+json'
		}
	});

	if (!response.ok) {
		throw new Error(`GitHub releases request failed (${response.status})`);
	}

	const releases = (await response.json()) as GithubRelease[];
	return pickLatestRelease(releases, prereleases);
}

export async function checkForUpdates(options?: {
	silent?: boolean;
	prereleases?: boolean;
}): Promise<UpdateCheckResult> {
	const silent = options?.silent ?? true;
	const prereleases = options?.prereleases ?? false;

	if (!isTauriApp()) {
		return { status: 'skipped' };
	}

	try {
		const appInfo = await getAppInfo();
		if (!appInfo.isPackaged) {
			return { status: 'skipped', currentVersion: appInfo.version };
		}

		const currentVersion = appInfo.version;
		const includePrereleases =
			prereleases || currentVersion.includes('alpha') || currentVersion.includes('beta');

		const latestRelease = await fetchLatestGithubRelease(GITHUB_REPO, includePrereleases);
		if (!latestRelease) {
			return { status: 'up-to-date', currentVersion };
		}

		if (!isNewerRelease(currentVersion, latestRelease.tag_name)) {
			return { status: 'up-to-date', currentVersion, release: latestRelease };
		}

		if (silent && isUpdateDismissed(latestRelease.tag_name)) {
			return { status: 'up-to-date', currentVersion, release: latestRelease };
		}

		return {
			status: 'update-available',
			currentVersion,
			release: latestRelease
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (!silent) {
			console.error('Update check failed', error);
		}
		return { status: 'error', error: message };
	}
}

export async function openReleasePage(url: string): Promise<void> {
	await openExternal(url);
}