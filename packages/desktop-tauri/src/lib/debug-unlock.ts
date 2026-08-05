/**
 * Hidden Debug settings unlock — tap the About build version 7 times.
 * Unlock is session-scoped (survives in-tab navigation, clears on app restart).
 */

const STORAGE_KEY = 'blacklight-debug-unlocked';
const TAP_TARGET = 7;
const TAP_WINDOW_MS = 4000;

let unlocked = false;
let tapCount = 0;
let windowStartedAt = 0;
const listeners = new Set<() => void>();

function readStoredUnlock(): boolean {
	if (typeof sessionStorage === 'undefined') return false;
	try {
		return sessionStorage.getItem(STORAGE_KEY) === '1';
	} catch {
		return false;
	}
}

function persistUnlock() {
	if (typeof sessionStorage === 'undefined') return;
	try {
		sessionStorage.setItem(STORAGE_KEY, '1');
	} catch {
		// ignore quota / private mode
	}
}

function notify() {
	for (const listener of listeners) listener();
}

/** Subscribe to unlock changes (for sidebar reactivity). */
export function subscribeDebugUnlock(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function isDebugUnlocked(): boolean {
	if (unlocked) return true;
	unlocked = readStoredUnlock();
	return unlocked;
}

/** Reactive-friendly alias used by UI. */
export function getDebugUnlocked(): boolean {
	return isDebugUnlocked();
}

/** Mark debug unlocked for this browser session. */
export function unlockDebug(): void {
	if (unlocked && readStoredUnlock()) return;
	unlocked = true;
	persistUnlock();
	tapCount = 0;
	windowStartedAt = 0;
	notify();
}

/**
 * Register a click on the About version label.
 * @returns `true` when this tap completed the unlock sequence.
 */
export function registerVersionTap(): boolean {
	if (isDebugUnlocked()) return false;

	const now = Date.now();
	if (windowStartedAt === 0 || now - windowStartedAt > TAP_WINDOW_MS) {
		windowStartedAt = now;
		tapCount = 1;
		return false;
	}

	tapCount += 1;
	if (tapCount < TAP_TARGET) return false;

	unlockDebug();
	return true;
}

/** Test helper — reset module state. */
export function _resetDebugUnlockForTests(): void {
	unlocked = false;
	tapCount = 0;
	windowStartedAt = 0;
	if (typeof sessionStorage !== 'undefined') {
		try {
			sessionStorage.removeItem(STORAGE_KEY);
		} catch {
			// ignore
		}
	}
}
