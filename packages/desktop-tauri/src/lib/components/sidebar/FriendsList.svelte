<script lang="ts">
	import { t } from '$lib/i18n';
	import { getIsAuthenticated } from '$lib/stores/auth.svelte';
	import {
		getFriends,
		getFriendsLoading,
		resetFriends,
		startFriendsWatch,
		stopFriendsWatch,
		type Friend
	} from '$lib/stores/friends.svelte';

	/**
	 * Temporary screenshot privacy: replace real gamertags / presence with placeholder copy.
	 * Flip to false when screenshots are done.
	 */
	const SCREENSHOT_MASK_FRIENDS = true;

	const FAKE_NAMES = [
		'Nova Pike',
		'Reed Ash',
		'Kai North',
		'Mira Vale',
		'Jon Harbor',
		'Elara Quinn',
		'Theo Marsh',
		'Sage Orion',
		'Lumen Fox',
		'Ivy Sol'
	];

	const FAKE_PRESENCE = [
		'Playing Starfield',
		'Online',
		'In a party',
		'Playing Forza Horizon 5',
		'Away',
		'Playing Halo Infinite',
		'Looking for group',
		'Playing Sea of Thieves'
	];

	const friends = $derived(getFriends());
	const loading = $derived(getFriendsLoading());

	function friendPresenceText(friend: Friend): string {
		for (const detail of friend.presenceDetails ?? []) {
			if (detail.IsGame && detail.IsPrimary && detail.PresenceText) {
				return detail.PresenceText;
			}
		}
		return friend.presenceText?.trim() || '';
	}

	function displayName(friend: Friend, index: number): string {
		if (!SCREENSHOT_MASK_FRIENDS) {
			return friend.displayName || friend.gamertag;
		}
		return FAKE_NAMES[index % FAKE_NAMES.length];
	}

	function displayPresence(friend: Friend, index: number): string {
		const real = friendPresenceText(friend);
		if (!real) return '';
		if (!SCREENSHOT_MASK_FRIENDS) return real;
		return FAKE_PRESENCE[index % FAKE_PRESENCE.length];
	}

	$effect(() => {
		if (!getIsAuthenticated()) {
			resetFriends();
			return;
		}

		startFriendsWatch();
		return () => stopFriendsWatch();
	});
</script>

<aside
	class="glass-panel hidden w-56 shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-surface/30 p-4 md:flex"
>
	<h3 class="mb-3 text-sm font-semibold text-white/60">
		{t('sidebar.friends.title', { defaultValue: 'Friends' })}
	</h3>
	{#if loading}
		<p class="text-xs text-white/30">Loading...</p>
	{:else if friends.length === 0}
		<p class="text-xs text-white/30">No friends online</p>
	{:else}
		<ul class="space-y-2">
			{#each friends as friend, index (friend.xuid)}
				<li class="text-sm text-white/70">
					<div class="truncate">
						<span class="mr-2 inline-block h-2 w-2 rounded-full bg-xbox-glow"></span>
						{displayName(friend, index)}
					</div>
					{#if displayPresence(friend, index)}
						<p class="mt-0.5 truncate pl-4 text-xs text-white/40">
							{displayPresence(friend, index)}
						</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</aside>
