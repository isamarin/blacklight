<script lang="ts">
	import { t } from '$lib/i18n';
	import { trpc } from '$lib/trpc';
	import { getIsAuthenticated, getWebToken } from '$lib/stores/auth.svelte';

	type PresenceDetail = {
		IsGame?: boolean;
		IsPrimary?: boolean;
		PresenceText?: string;
	};

	type Friend = {
		xuid: string;
		gamertag: string;
		displayName?: string;
		presenceState?: string;
		presenceText?: string;
		presenceDetails?: PresenceDetail[];
	};

	let friends = $state<Friend[]>([]);
	let loading = $state(false);

	function friendPresenceText(friend: Friend): string {
		for (const detail of friend.presenceDetails ?? []) {
			if (detail.IsGame && detail.IsPrimary && detail.PresenceText) {
				return detail.PresenceText;
			}
		}
		return friend.presenceText?.trim() || '';
	}

	$effect(() => {
		if (!getIsAuthenticated()) {
			friends = [];
			return;
		}

		let cancelled = false;
		const load = async () => {
			loading = true;
			try {
				const data = await trpc.profile_get_friends.query(getWebToken());
				if (!cancelled) {
					const people = (data?.data?.people as Friend[] | undefined) ?? [];
					friends = people.filter((friend) => friend.presenceState !== 'Offline');
				}
			} catch (e) {
				console.error('Failed to load friends', e);
			} finally {
				if (!cancelled) loading = false;
			}
		};

		load();
		const interval = setInterval(load, 30_000);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
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
			{#each friends as friend (friend.xuid)}
				<li class="text-sm text-white/70">
					<div class="truncate">
						<span class="mr-2 inline-block h-2 w-2 rounded-full bg-xbox-glow"></span>
						{friend.displayName || friend.gamertag}
					</div>
					{#if friendPresenceText(friend)}
						<p class="mt-0.5 truncate pl-4 text-xs text-white/40">
							{friendPresenceText(friend)}
						</p>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</aside>