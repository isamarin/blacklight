<script lang="ts">
	import { extractErrorMessage } from '$lib/errors';
	import { t } from '$lib/i18n';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import TitleRow from '$lib/components/xcloud/TitleRow.svelte';
	import ContinueHero from '$lib/components/xcloud/ContinueHero.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ErrorPanel from '$lib/components/ui/ErrorPanel.svelte';
	import {
		getCatalogError,
		getCatalogErrorRaw,
		getCatalogIsLoading,
		getNewIds,
		getRecentIds,
		refreshTitleCatalog
	} from '$lib/stores/titleCatalog.svelte';

	const catalogError = $derived(getCatalogError());
	const catalogErrorRaw = $derived(getCatalogErrorRaw());
	const recentIds = $derived(getRecentIds());
	const newIds = $derived(getNewIds());
	const continueId = $derived(recentIds[0] ?? null);
	const recentRest = $derived(continueId ? recentIds.slice(1) : recentIds);
</script>

<AppLayout title={t('header.home')}>
	<header class="mb-6 flex items-baseline gap-3">
		<h1 class="text-2xl font-bold tracking-tight text-white">{t('header.home')}</h1>
		<span class="text-xs text-white/40">xCloud</span>
	</header>

	{#if catalogError}
		<ErrorPanel
			code={catalogError}
			detail={extractErrorMessage(catalogErrorRaw)}
			rawError={catalogErrorRaw}
			onRetry={() => refreshTitleCatalog()}
		/>
	{:else if getCatalogIsLoading()}
		<p class="text-white/40">{t('page.xCloud.loadingLibrary')}</p>
	{:else}
		{#if continueId}
			<ContinueHero titleId={continueId} />
		{/if}

		{#if recentRest.length > 0}
			<TitleRow titleIds={recentRest} layout="grid">
				{#snippet title()}
					{t('page.xCloud.recentGames')}
				{/snippet}
			</TitleRow>
		{:else if !continueId}
			<p class="mb-8 text-sm text-white/40">{t('page.xCloud.noRecentGames')}</p>
		{/if}

		<TitleRow titleIds={newIds} layout="grid">
			{#snippet title()}
				<span class="flex flex-wrap items-center gap-3">
					{t('page.xCloud.recentlyAdded')}
					<a href="/xcloud/library">
						<Button label={t('page.xCloud.viewLibraryBtn')} variant="secondary" size="sm" />
					</a>
				</span>
			{/snippet}
		</TitleRow>
	{/if}
</AppLayout>
