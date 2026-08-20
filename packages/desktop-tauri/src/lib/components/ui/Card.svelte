<script lang="ts">
	import { cardGlow } from '$lib/actions/card-glow';

	let {
		children,
		glow = false,
		class: className = ''
	}: { children: import('svelte').Snippet; glow?: boolean; class?: string } = $props();
</script>

{#if glow}
	<div use:cardGlow class="glass card-glow rounded-2xl p-5 shadow-lg shadow-black/20 {className}">
		{@render children()}
	</div>
{:else}
	<div class="glass rounded-2xl p-5 shadow-lg shadow-black/20 {className}">
		{@render children()}
	</div>
{/if}
