<script lang="ts">
	import { t } from '$lib/i18n';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import TitleRow from '$lib/components/xcloud/TitleRow.svelte';
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
</script>

<AppLayout title={t('page.xCloud.pageTitle')}>
	<h1 class="text-2xl font-bold text-white mb-6">{t('page.xCloud.pageTitle')}</h1>
	{#if catalogError}
		<ErrorPanel
			code={catalogError}
			rawError={catalogErrorRaw}
			onRetry={() => refreshTitleCatalog()}
		/>
	{:else if getCatalogIsLoading()}
		<p class="text-white/40">{t('page.xCloud.loadingLibrary')}</p>
	{:else}
		<TitleRow titleIds={getRecentIds()}>
			{#snippet title()}
				{t('page.xCloud.recentGames')}
			{/snippet}
		</TitleRow>
		<TitleRow titleIds={getNewIds()}>
			{#snippet title()}
				<span class="flex items-center gap-3">
					{t('page.xCloud.recentlyAdded')}
					<a href="/xcloud/library">
						<Button label={t('page.xCloud.viewLibraryBtn')} variant="secondary" size="sm" />
					</a>
				</span>
			{/snippet}
		</TitleRow>
	{/if}
</AppLayout>