<script lang="ts">
	import { cachedMediaUrl, normalizeMediaUrl, type MediaPreset } from '$lib/media-cache';

	let {
		src,
		preset,
		alt = '',
		class: className = '',
		loading = 'lazy'
	}: {
		src: string | null | undefined;
		preset: MediaPreset;
		alt?: string;
		class?: string;
		loading?: 'lazy' | 'eager';
	} = $props();

	let useDirect = $state(false);

	const directSrc = $derived(normalizeMediaUrl(src) ?? undefined);
	const cachedSrc = $derived(cachedMediaUrl(src, preset));
	const resolvedSrc = $derived(
		useDirect ? directSrc : (cachedSrc ?? directSrc ?? undefined)
	);

	function handleError() {
		if (!useDirect && directSrc && cachedSrc && cachedSrc !== directSrc) {
			useDirect = true;
		}
	}
</script>

{#if resolvedSrc}
	<img src={resolvedSrc} {alt} class={className} {loading} onerror={handleError} />
{/if}