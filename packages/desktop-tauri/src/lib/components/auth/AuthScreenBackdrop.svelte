<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="auth-screen">
	<div class="auth-screen-backdrop" aria-hidden="true">
		<img
			src="/images/hero-background.png"
			alt=""
			class="auth-screen-image"
			loading="eager"
			decoding="async"
		/>
	</div>
	<div class="auth-screen-content">
		{@render children()}
	</div>
</div>