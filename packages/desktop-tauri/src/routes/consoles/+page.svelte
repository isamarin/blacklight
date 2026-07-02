<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { trpc } from '$lib/trpc';
	import { getWebToken } from '$lib/stores/auth.svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Label from '$lib/components/ui/Label.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';

	let loading = $state(true);
	let list = $state<Array<Record<string, unknown>>>([]);

	onMount(async () => {
		try {
			const data = await trpc.smartglass_consoles_list.query(getWebToken());
			list = (data?.data?.result as Array<Record<string, unknown>>) || [];
		} finally {
			loading = false;
		}
	});
</script>

<AppLayout title={t('page.myConsoles.pageTitle')}>
	<h1 class="text-2xl font-bold text-white mb-6">{t('page.myConsoles.pageTitle')}</h1>
	<div class="flex flex-wrap gap-4">
		{#if loading}
			<Loader />
		{:else if list.length === 0}
			<Card>{t('page.myConsoles.noConsoles')}</Card>
		{:else}
			{#each list as item (item.id as string)}
				<Card class="w-72">
					<h2 class="text-lg font-semibold text-white mb-2">{item.name as string}</h2>
					<p class="text-xs text-white/40 mb-3">{item.id as string}</p>
					{#if item.remoteManagementEnabled && item.consoleStreamingEnabled}
						{#if item.powerState === 'On'}
							<Label variant="green">{t('page.myConsoles.poweredOn')}</Label>
						{:else}
							<Label>{item.powerState as string}</Label>
						{/if}
					{:else}
						<Label variant="orange">{t('page.myConsoles.warningLabel')}</Label>
					{/if}
					<div class="mt-4">
						<a href="/stream/{item.id as string}">
							<Button label={t('page.myConsoles.startStreamBtn')} />
						</a>
					</div>
				</Card>
			{/each}
		{/if}
	</div>
</AppLayout>