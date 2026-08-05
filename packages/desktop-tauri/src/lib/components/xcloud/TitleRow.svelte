<script lang="ts">
	import GameTitle from '$lib/components/game/GameTitle.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';

	let {
		title,
		titleIds,
		layout = 'grid'
	}: {
		title: import('svelte').Snippet;
		titleIds: string[];
		layout?: 'grid' | 'row';
	} = $props();
</script>

<section class="mb-8">
	<div class="mb-4 flex flex-wrap items-center gap-3 text-lg font-semibold text-white">
		{@render title()}
	</div>
	{#if titleIds.length === 0}
		<Loader />
	{:else if layout === 'row'}
		<div class="flex gap-4 overflow-x-auto pb-2">
			{#each titleIds as id (id)}
				<GameTitle titleId={id} layout="compact" />
			{/each}
		</div>
	{:else}
		<div class="game-tile-grid">
			{#each titleIds as id (id)}
				<GameTitle titleId={id} layout="tile" />
			{/each}
		</div>
	{/if}
</section>
