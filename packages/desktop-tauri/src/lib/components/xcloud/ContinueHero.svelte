<script lang="ts">
	import { getTitle } from '$lib/stores/titleCatalog.svelte';
	import { t } from '$lib/i18n';
	import CachedImage from '$lib/components/ui/CachedImage.svelte';

	let { titleId }: { titleId: string } = $props();

	const entry = $derived(getTitle(titleId));
	const product = $derived(entry?.catalogDetails as Record<string, unknown> | undefined);
	const name = $derived((product?.ProductTitle as string) || titleId);
	const heroImage = $derived(
		(product?.Image_Poster as { URL?: string } | undefined)?.URL ||
			(product?.Image_Tile as { URL?: string } | undefined)?.URL
	);
</script>

<section class="home-hero mb-8">
	{#if heroImage}
		<div class="home-hero-media" aria-hidden="true">
			<CachedImage
				src={heroImage}
				preset="tile"
				alt=""
				class="h-full w-full object-cover"
				loading="eager"
			/>
		</div>
	{/if}
	<div class="home-hero-body">
		<div class="home-hero-kicker">{t('page.xCloud.continuePlaying')}</div>
		<h2 class="home-hero-title">{name}</h2>
		<div class="flex flex-wrap items-center gap-3">
			<a
				href="/stream/xcloud_{titleId}"
				class="glass-btn glass-btn-solid glass-btn-md no-underline"
			>
				<span class="glass-btn-shine" aria-hidden="true"></span>
				<span class="relative z-10">{t('page.xCloud.startStreamBtn')}</span>
			</a>
			<a
				href="/xcloud/info/{titleId}"
				class="glass-btn glass-btn-secondary glass-btn-md no-underline"
			>
				<span class="glass-btn-shine" aria-hidden="true"></span>
				<span class="relative z-10">{t('page.xCloud.viewGameBtn')}</span>
			</a>
		</div>
	</div>
</section>
