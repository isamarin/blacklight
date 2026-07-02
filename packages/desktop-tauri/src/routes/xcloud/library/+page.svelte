<script lang="ts">
	import { t } from '$lib/i18n';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';
	import GameTitle from '$lib/components/game/GameTitle.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';
	import ErrorPanel from '$lib/components/ui/ErrorPanel.svelte';
	import {
		filterTitles,
		getCatalogError,
		getCatalogIsLoading,
		getTitles,
		refreshTitleCatalog
	} from '$lib/stores/titleCatalog.svelte';

	let filter = $state('');
	const titleIds = $derived(filter ? filterTitles(filter) : getTitles().map((t) => t.titleId));
	const catalogError = $derived(getCatalogError());
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
			class="flex-1 max-w-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
			bind:value={filter}
		/>
	</div>
	{#if catalogError}
		<ErrorPanel code={catalogError} onRetry={() => refreshTitleCatalog()} />
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