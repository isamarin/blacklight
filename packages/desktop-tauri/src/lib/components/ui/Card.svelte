<script lang="ts">
	let { children, class: className = '' }: { children: import('svelte').Snippet; class?: string } =
		$props();
</script>

<div class="glass rounded-xl p-5 border border-white/5 {className}">
	{@render children()}
</div>