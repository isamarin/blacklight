<script lang="ts">
	import { extractErrorMessage } from '$lib/errors';
	import { t } from '$lib/i18n';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';
	import GameTitle from '$lib/components/game/GameTitle.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';
	import ErrorPanel from '$lib/components/ui/ErrorPanel.svelte';
	import {
		filterTitles,
		getCatalogError,
		getCatalogErrorRaw,
		getCatalogIsLoading,
		getTitles,
		refreshTitleCatalog
	} from '$lib/stores/titleCatalog.svelte';

	let filter = $state('');
	const titleIds = $derived(filter ? filterTitles(filter) : getTitles().map((t) => t.titleId));
	const catalogError = $derived(getCatalogError());
	const catalogErrorRaw = $derived(getCatalogErrorRaw());
</script>

<AppLayout title={t('page.xCloudLibrary.pageTitle')}>
	<Breadcrumb
		items={[
			{ href: '/home', label: t('page.xCloudLibrary.breadcrumb1') },
			{ href: '/xcloud/library', label: t('page.xCloudLibrary.breadcrumb2') }
		]}
	/>
	<div class="flex items-center gap-4 mb-6">
		<h1 class="text-2xl font-bold text-white">{t('page.xCloudLibrary.title')}</h1>
		<input
			type="text"
			placeholder={t('page.xCloudLibrary.searchPlaceholder')}
			class="glass-control max-w-xs flex-1 px-3 py-2 text-sm"
			bind:value={filter}
		/>
	</div>
	{#if catalogError}
		<ErrorPanel
			code={catalogError}
			detail={extractErrorMessage(catalogErrorRaw)}
			rawError={catalogErrorRaw}
			onRetry={() => refreshTitleCatalog()}
		/>
	{:else if getCatalogIsLoading()}
		<Loader />
	{:else if titleIds.length === 0}
		<p class="text-white/40">{t('page.xCloudLibrary.emptyLibrary')}</p>
	{:else}
		<div class="flex flex-wrap gap-4">
			{#each titleIds as id (id)}
				<GameTitle titleId={id} />
			{/each}
		</div>
	{/if}
</AppLayout>