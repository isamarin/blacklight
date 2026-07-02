<script lang="ts">
	import GameTitle from '$lib/components/game/GameTitle.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';

	let {
		title,
		titleIds
	}: {
		title: import('svelte').Snippet;
		titleIds: string[];
	} = $props();
</script>

<section class="mb-8">
	<h2 class="text-lg font-semibold text-white mb-4">
		{@render title()}
	</h2>
	<div class="flex gap-4 overflow-x-auto pb-2">
		{#if titleIds.length === 0}
			<Loader />
		{:else}
			{#each titleIds as id (id)}
				<GameTitle titleId={id} />
			{/each}
		{/if}
	</div>
</section>