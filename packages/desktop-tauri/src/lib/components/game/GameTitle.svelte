<script lang="ts">
	import { getTitle } from '$lib/stores/titleCatalog.svelte';
	import { createTitleDetails } from '$lib/stores/titleDetails.svelte';
	import CachedImage from '$lib/components/ui/CachedImage.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';

	let {
		titleId,
		layout = 'tile'
	}: {
		titleId: string;
		/** `tile` = design-beta square card; `compact` = legacy fixed width */
		layout?: 'tile' | 'compact';
	} = $props();

	const details = createTitleDetails(() => titleId);
	const cached = $derived(getTitle(titleId));
	const product = $derived(details.product);
	const loading = $derived(details.loading);
	const name = $derived(details.name);
	const image = $derived(product?.Image_Tile as { URL?: string } | undefined);
</script>

{#if !product && (loading || !cached)}
	<div class={layout === 'tile' ? 'aspect-square' : 'h-[140px] w-[140px]'} aria-busy="true">
		<Loader />
	</div>
{:else if layout === 'compact'}
	<div class="group relative w-[140px] shrink-0">
		<a
			href="/xcloud/info/{titleId}"
			class="absolute top-1 right-1 z-10 flex h-6 w-6 items-center justify-center rounded bg-black/60 text-xs text-white/70 opacity-0 group-hover:opacity-100"
			title="Info"
		>
			i
		</a>
		<a href="/stream/xcloud_{titleId}" class="block">
			{#if image?.URL}
				<CachedImage
					src={image.URL}
					preset="tile"
					alt={name}
					class="h-[140px] w-[140px] rounded object-cover"
				/>
			{:else}
				<div
					class="flex h-[140px] w-[140px] items-center justify-center rounded bg-white/5 text-xs text-white/30"
				>
					{titleId}
				</div>
			{/if}
			<p class="mt-2 line-clamp-2 text-xs text-white/70">{name}</p>
		</a>
	</div>
{:else}
	<div class="game-tile-wrap relative">
		<a
			href="/xcloud/info/{titleId}"
			class="game-tile-info"
			title="Info"
			aria-label="Info"
		>
			i
		</a>
		<a href="/stream/xcloud_{titleId}" class="game-tile" title={name}>
			{#if image?.URL}
				<CachedImage src={image.URL} preset="tile" alt={name} class="game-tile-image" />
			{:else}
				<div class="game-tile-fallback">{name}</div>
			{/if}
			<span class="game-tile-caption line-clamp-2">{name}</span>
		</a>
	</div>
{/if}
