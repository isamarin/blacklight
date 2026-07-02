<script lang="ts">
	let { items }: { items: { href: string; label: string }[] } = $props();
</script>

<nav class="flex gap-2 text-sm text-white/50 mb-6">
	{#each items as item, i (item.href)}
		<span class="flex items-center gap-2">
			{#if i > 0}<span>/</span>{/if}
			<a href={item.href} class="hover:text-[#107C10]">{item.label}</a>
		</span>
	{/each}
</nav>