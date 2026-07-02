<script lang="ts">
	let { children, class: className = '' }: { children: import('svelte').Snippet; class?: string } =
		$props();
</script>

<div class="glass rounded-2xl p-5 shadow-lg shadow-black/20 {className}">
	{@render children()}
</div>