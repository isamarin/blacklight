<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
	import { trpc } from '$lib/trpc';
	import { getxHomeToken } from '$lib/stores/auth.svelte';
	import { getTitle } from '$lib/stores/titleCatalog.svelte';
	import { getProducts } from '$lib/titles';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import CachedImage from '$lib/components/ui/CachedImage.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';

	const titleId = $derived(page.params.titleid ?? '');
	let product = $state<Record<string, unknown> | undefined>(undefined);
	let loading = $state(true);

	$effect(() => {
		if (!titleId) return;
		const cached = getTitle(titleId);
		if (cached?.catalogDetails) {
			product = cached.catalogDetails;
			loading = false;
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
</script>

{#if loading || !product}
	<AppLayout>
		<Loader />
	</AppLayout>
{:else}
	<AppLayout title={product.ProductTitle as string}>
		<Breadcrumb
			items={[
				{ href: '/home', label: t('page.titleInfo.breadcrumb1') },
				{ href: '/xcloud/library', label: t('page.titleInfo.breadcrumb2') },
				{ href: `/xcloud/info/${titleId}`, label: product.ProductTitle as string }
			]}
		/>
		<div class="flex gap-8">
			<div class="shrink-0">
				{#if (product.Image_Poster as { URL?: string })?.URL}
					<CachedImage
						src={(product.Image_Poster as { URL: string }).URL}
						preset="poster"
						alt={product.ProductTitle as string}
						class="w-40 rounded-lg"
					/>
				{/if}
				<a href="/stream/xcloud_{titleId}" class="block mt-4">
					<Button label={t('page.titleInfo.startStreamBtn')} />
				</a>
			</div>
			<div>
				<h1 class="text-3xl font-bold text-white">{product.ProductTitle as string}</h1>
				<p class="text-white/50 mt-1">
					{t('page.titleInfo.by')}
					{product.PublisherName as string}
				</p>
				<h3 class="text-lg font-semibold text-white mt-6">
					{t('page.titleInfo.descriptionTitle')}
				</h3>
				<p class="text-white/70 mt-2">{product.ProductDescriptionShort as string}</p>
			</div>
		</div>
	</AppLayout>
{/if}