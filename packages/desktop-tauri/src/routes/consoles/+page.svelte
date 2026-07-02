<script lang="ts">
	import { t } from '$lib/i18n';
	import { classifyError, extractErrorMessage, type UserErrorCode } from '$lib/errors';
	import { getWebToken } from '$lib/stores/auth.svelte';
	import {
		type ConsoleInfo,
		ensureConsoleAwake,
		fetchConsoles,
		isConsoleReady,
		wakeConsole,
		waitForConsolePowerOn
	} from '$lib/consoles';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Label from '$lib/components/ui/Label.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';
	import ErrorPanel from '$lib/components/ui/ErrorPanel.svelte';

	let loading = $state(false);
	let list = $state<ConsoleInfo[]>([]);
	let errorCode = $state<UserErrorCode | null>(null);
	let errorDetail = $state<string | null>(null);
	let wakingConsoleId = $state<string | null>(null);
	let loadGeneration = 0;

	function powerStateLabel(item: ConsoleInfo): string {
		if (item.powerState === 'On') return t('page.myConsoles.poweredOn');
		if (item.powerState === 'ConnectedStandby') return t('page.myConsoles.standby');
		return item.powerState || t('page.myConsoles.offline');
	}

	function canStream(item: ConsoleInfo): boolean {
		return Boolean(item.remoteManagementEnabled && item.consoleStreamingEnabled);
	}

	function canWake(item: ConsoleInfo): boolean {
		return canStream(item) && !isConsoleReady(item);
	}

	async function loadConsoles() {
		const token = getWebToken();
		if (!token.token || !token.uhs) {
			errorCode = 'web_tokens';
			errorDetail = null;
			list = [];
			loading = false;
			return;
		}

		const generation = ++loadGeneration;
		loading = true;
		errorCode = null;
		errorDetail = null;

		try {
			const data = await fetchConsoles(token);
			if (generation !== loadGeneration) return;
			list = data;
		} catch (e) {
			if (generation !== loadGeneration) return;
			errorCode = classifyError(e);
			errorDetail = extractErrorMessage(e);
			list = [];
		} finally {
			if (generation === loadGeneration) {
				loading = false;
			}
		}
	}

	async function handleWake(item: ConsoleInfo) {
		const token = getWebToken();
		if (!token.token || !token.uhs) {
			errorCode = 'web_tokens';
			return;
		}

		wakingConsoleId = item.id;
		errorCode = null;
		errorDetail = null;

		try {
			await wakeConsole(token, item.id);
			await waitForConsolePowerOn(token, item.id);
			await loadConsoles();
		} catch (e) {
			errorCode = 'console_wake_failed';
			errorDetail = extractErrorMessage(e);
		} finally {
			wakingConsoleId = null;
		}
	}

	async function handleWakeAndStream(item: ConsoleInfo) {
		const token = getWebToken();
		if (!token.token || !token.uhs) {
			errorCode = 'web_tokens';
			return;
		}

		wakingConsoleId = item.id;
		errorCode = null;
		errorDetail = null;

		try {
			await ensureConsoleAwake(token, item.id);
			window.location.href = `/stream/${item.id}`;
		} catch (e) {
			errorCode = 'console_wake_failed';
			errorDetail = extractErrorMessage(e);
			wakingConsoleId = null;
		}
	}

	$effect(() => {
		void loadConsoles();
	});
</script>

<AppLayout title={t('page.myConsoles.pageTitle')}>
	<h1 class="text-2xl font-bold text-white mb-6">{t('page.myConsoles.pageTitle')}</h1>
	<div class="flex flex-wrap gap-4">
		{#if errorCode}
			<ErrorPanel code={errorCode} detail={errorDetail} onRetry={loadConsoles} />
		{:else if loading}
			<Loader />
		{:else if list.length === 0}
			<Card>
				<p class="text-white/80">{t('page.myConsoles.noConsoles')}</p>
				<div class="mt-4">
					<Button label={t('errors.retryBtn')} onclick={loadConsoles} class="text-sm" />
				</div>
			</Card>
		{:else}
			{#each list as item (item.id)}
				<Card class="w-72">
					<h2 class="text-lg font-semibold text-white mb-2">{item.name}</h2>
					<p class="text-xs text-white/40 mb-3">{item.id}</p>
					{#if canStream(item)}
						{#if isConsoleReady(item)}
							<Label variant="green">{powerStateLabel(item)}</Label>
						{:else}
							<Label>{powerStateLabel(item)}</Label>
						{/if}
					{:else}
						<Label variant="orange">{t('page.myConsoles.warningLabel')}</Label>
					{/if}
					<div class="mt-4 flex flex-col gap-2">
						{#if canStream(item)}
							{#if canWake(item)}
								<Button
									label={wakingConsoleId === item.id
										? t('page.myConsoles.wakingBtn')
										: t('page.myConsoles.wakeBtn')}
									onclick={() => handleWake(item)}
									disabled={wakingConsoleId !== null}
									class="text-sm"
								/>
								<Button
									label={wakingConsoleId === item.id
										? t('page.myConsoles.wakingBtn')
										: t('page.myConsoles.wakeAndStreamBtn')}
									onclick={() => handleWakeAndStream(item)}
									disabled={wakingConsoleId !== null}
								/>
							{:else}
								<a href="/stream/{item.id}">
									<Button label={t('page.myConsoles.startStreamBtn')} />
								</a>
							{/if}
						{/if}
					</div>
				</Card>
			{/each}
		{/if}
	</div>
</AppLayout>