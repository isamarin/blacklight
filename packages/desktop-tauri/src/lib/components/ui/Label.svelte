<script lang="ts">
	let {
		children,
		variant = 'default'
	}: {
		children: import('svelte').Snippet;
		variant?: 'default' | 'green' | 'orange';
	} = $props();

	const colors = {
		default: 'bg-white/10 text-white/70',
		green: 'bg-green-900/40 text-green-300',
		orange: 'bg-orange-900/40 text-orange-300'
	};
</script>

<span class="inline-block px-2 py-0.5 rounded text-xs {colors[variant]}">
	{@render children()}
</span>