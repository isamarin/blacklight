<script lang="ts">
	let {
		children,
		variant = 'default'
	}: {
		children: import('svelte').Snippet;
		variant?: 'default' | 'green' | 'orange';
	} = $props();

	const variantClass = $derived(
		variant === 'green'
			? 'glass-pill-green'
			: variant === 'orange'
				? 'glass-pill-orange'
				: 'glass-pill-default'
	);
</script>

<span class="glass-pill {variantClass}">
	{@render children()}
</span>