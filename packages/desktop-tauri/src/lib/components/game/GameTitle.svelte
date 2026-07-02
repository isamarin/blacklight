<script lang="ts">
	import { trpc } from '$lib/trpc';
	import { getxHomeToken } from '$lib/stores/auth.svelte';
	import { getTitle } from '$lib/stores/titleCatalog.svelte';
	import { getProducts } from '$lib/titles';
	import CachedImage from '$lib/components/ui/CachedImage.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';

	let { titleId }: { titleId: string } = $props();

	let product = $state<Record<string, unknown> | undefined>(undefined);
	let loading = $state(false);

	const cached = $derived(getTitle(titleId));

	$effect(() => {
		if (cached?.catalogDetails) {
			product = cached.catalogDetails;
			return;
		}

		let cancelled = false;
		loading = true;

		trpc.gamepass_resolve_productid
			.query({
				token: getxHomeToken(),
				productId: cached?.productId || titleId
			})
			.then((resolved) => {
				if (cancelled) return;
				const products = getProducts(resolved);
				product = products ? (Object.values(products)[0] as Record<string, unknown>) : undefined;
			})
			.finally(() => {
				if (!cancelled) loading = false;
			});

		return () => {
			cancelled = true;
		};
	});

	const name = $derived((product?.ProductTitle as string) || titleId);
	const image = $derived(product?.Image_Tile as { URL?: string } | undefined);
</script>

{#if !product && (loading || !cached)}
	<Loader />
{:else}
	<div class="group relative w-[140px] shrink-0">
		<a
			href="/xcloud/info/{titleId}"
			class="absolute top-1 right-1 z-10 w-6 h-6 rounded bg-black/60 text-white/70 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
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
					class="w-[140px] h-[140px] rounded object-cover"
				/>
			{:else}
				<div
					class="w-[140px] h-[140px] rounded bg-white/5 flex items-center justify-center text-white/30 text-xs"
				>
					{titleId}
				</div>
			{/if}
			<p class="mt-2 text-xs text-white/70 line-clamp-2">{name}</p>
		</a>
	</div>
{/if}