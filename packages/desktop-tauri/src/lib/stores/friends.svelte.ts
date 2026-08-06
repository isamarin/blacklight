import { getIsAuthenticated, getWebToken } from '$lib/stores/auth.svelte';
import { trpc } from '$lib/trpc';

export type PresenceDetail = {
	IsGame?: boolean;
	IsPrimary?: boolean;
	PresenceText?: string;
};

export type Friend = {
	xuid: string;
	gamertag: string;
	displayName?: string;
	presenceState?: string;
	presenceText?: string;
	presenceDetails?: PresenceDetail[];
};

type FriendsListResponse = {
	data?: {
		people?: Friend[];
	};
};

/** Presence poll interval while any FriendsList is mounted. */
const REFRESH_MS = 30_000;
/** Skip network on remount if we fetched within this window. */
const STALE_MS = 25_000;

let friends = $state<Friend[]>([]);
/** True only when there is no cached list yet (avoids flash on tab switch). */
let loading = $state(false);
let lastFetchAt = 0;
let hasLoaded = false;
let inflight: Promise<void> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let watchers = 0;

function filterOnline(people: Friend[]): Friend[] {
	return people.filter((friend) => friend.presenceState !== 'Offline');
}

export function getFriends(): Friend[] {
	return friends;
}

export function getFriendsLoading(): boolean {
	return loading;
}

export function resetFriends(): void {
	friends = [];
	loading = false;
	hasLoaded = false;
	lastFetchAt = 0;
	inflight = null;
	if (pollTimer) {
		clearInterval(pollTimer);
		pollTimer = null;
	}
	watchers = 0;
}

export async function refreshFriends(options?: {
	force?: boolean;
	/** Used on mount: skip fetch when cache is still fresh. */
	onlyIfStale?: boolean;
}): Promise<void> {
	if (!getIsAuthenticated()) {
		resetFriends();
		return;
	}

	if (
		options?.onlyIfStale &&
		!options.force &&
		hasLoaded &&
		Date.now() - lastFetchAt < STALE_MS
	) {
		return;
	}

	if (inflight) {
		return inflight;
	}

	const showSpinner = !hasLoaded;
	if (showSpinner) {
		loading = true;
	}

	inflight = (async () => {
		try {
			const data = (await trpc.profile_get_friends.query(
				getWebToken()
			)) as FriendsListResponse;
			const people = data.data?.people ?? [];
			friends = filterOnline(people);
			hasLoaded = true;
			lastFetchAt = Date.now();
		} catch (e) {
			console.error('Failed to load friends', e);
		} finally {
			loading = false;
			inflight = null;
		}
	})();

	return inflight;
}

/**
 * Keep a shared poll alive while at least one FriendsList is mounted.
 * AppLayout remounts on every route change — without this, each tab switch
 * would hit Xbox again and flash "Loading...".
 */
export function startFriendsWatch(): void {
	watchers += 1;
	if (watchers !== 1) return;

	void refreshFriends({ onlyIfStale: true });
	pollTimer = setInterval(() => {
		void refreshFriends();
	}, REFRESH_MS);
}

export function stopFriendsWatch(): void {
	watchers = Math.max(0, watchers - 1);
	if (watchers > 0) return;

	if (pollTimer) {
		clearInterval(pollTimer);
		pollTimer = null;
	}
}
