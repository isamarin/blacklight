<script lang="ts">
	import { t } from '$lib/i18n';
	import { trpc } from '$lib/trpc';
	import { getIsAuthenticated, getWebToken } from '$lib/stores/auth.svelte';

	let friends = $state<Array<{ xuid: string; gamertag: string }>>([]);
	let loading = $state(false);

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
					friends = (data?.data?.people as Array<{ xuid: string; gamertag: string }>) || [];
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

<aside class="hidden xl:flex w-56 flex-col border-l border-white/5 bg-[#0a0a0a] p-4">
	<h3 class="text-sm font-semibold text-white/60 mb-3">
		{t('sidebar.friends.title', { defaultValue: 'Friends' })}
	</h3>
	{#if loading}
		<p class="text-xs text-white/30">Loading...</p>
	{:else if friends.length === 0}
		<p class="text-xs text-white/30">No friends online</p>
	{:else}
		<ul class="space-y-2">
			{#each friends as friend (friend.xuid)}
				<li class="text-sm text-white/70 truncate">
					<span class="inline-block w-2 h-2 rounded-full bg-[#107C10] mr-2"></span>
					{friend.gamertag}
				</li>
			{/each}
		</ul>
	{/if}
</aside>