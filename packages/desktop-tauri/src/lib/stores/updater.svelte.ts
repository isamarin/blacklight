import {
	checkForUpdates,
	dismissUpdate,
	openReleasePage,
	type GithubRelease,
	type UpdateCheckResult
} from '$lib/updater';

let pendingRelease = $state<GithubRelease | null>(null);
let currentVersion = $state<string | null>(null);
let checking = $state(false);
let lastResult = $state<UpdateCheckResult | null>(null);

export function getPendingUpdate() {
	return pendingRelease;
}

export function getUpdateCurrentVersion() {
	return currentVersion;
}

export function isCheckingForUpdates() {
	return checking;
}

export function getLastUpdateCheck() {
	return lastResult;
}

export function clearPendingUpdate() {
	pendingRelease = null;
	currentVersion = null;
}

export async function runUpdateCheck(options?: { silent?: boolean; prereleases?: boolean }) {
	if (checking) return lastResult;

	checking = true;
	try {
		const result = await checkForUpdates(options);
		lastResult = result;

		if (result.status === 'update-available' && result.release && result.currentVersion) {
			pendingRelease = result.release;
			currentVersion = result.currentVersion;
		}

		return result;
	} finally {
		checking = false;
	}
}

export async function remindUpdateLater() {
	if (pendingRelease) {
		dismissUpdate(pendingRelease.tag_name);
	}
	clearPendingUpdate();
}

export async function downloadPendingUpdate() {
	if (!pendingRelease) return;
	const url = pendingRelease.html_url;
	clearPendingUpdate();
	await openReleasePage(url);
}