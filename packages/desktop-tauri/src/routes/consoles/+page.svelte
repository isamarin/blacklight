<script lang="ts">
	import { cardGlow } from '$lib/actions/card-glow';
	import { t } from '$lib/i18n';
	import { classifyError, extractErrorMessage, type UserErrorCode } from '$lib/errors';
	import { getWebToken } from '$lib/stores/auth.svelte';
	import {
		type ConsoleInfo,
		ensureConsoleAwake,
		fetchConsoles,
		isConsoleReady,
		isConsoleWakeTimeout,
		wakeConsole,
		waitForConsolePowerOn
	} from '$lib/consoles';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import Card from '$lib/components/ui/Card.svelte';
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
		if (wakingConsoleId === item.id) return t('page.myConsoles.wakingBtn');
		if (item.powerState === 'On') return t('page.myConsoles.poweredOn');
		if (item.powerState === 'ConnectedStandby') return t('page.myConsoles.standby');
		return item.powerState || t('page.myConsoles.offline');
	}

	function statusClass(item: ConsoleInfo): string {
		if (wakingConsoleId === item.id) return 'console-status-waking';
		if (!canStream(item)) return 'console-status-warn';
		if (item.powerState === 'On') return 'console-status-on';
		if (item.powerState === 'ConnectedStandby') return 'console-status-standby';
		return 'console-status-off';
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
			if (isConsoleWakeTimeout(e)) {
				window.location.href = `/stream/${item.id}`;
				return;
			}
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
	<header class="mb-6 flex items-baseline gap-3">
		<h1 class="text-2xl font-bold tracking-tight text-white">{t('page.myConsoles.pageTitle')}</h1>
		<span class="text-xs text-white/40">xHome Streaming</span>
	</header>

	{#if errorCode}
		<ErrorPanel code={errorCode} detail={errorDetail} onRetry={loadConsoles} />
	{:else if loading}
		<Loader />
	{:else if list.length === 0}
		<Card>
			<p class="text-white/80">{t('page.myConsoles.noConsoles')}</p>
			<div class="mt-4">
				<Button label={t('errors.retryBtn')} onclick={loadConsoles} size="sm" />
			</div>
		</Card>
	{:else}
		<div class="console-grid">
			{#each list as item (item.id)}
				<article use:cardGlow class="console-card card-glow">
					<div class="console-card-head">
						<div class="min-w-0">
							<h2 class="console-card-name">{item.name}</h2>
							<p class="console-card-id">{item.id}</p>
						</div>
						<span class="console-status {statusClass(item)}">
							<span class="console-status-dot" aria-hidden="true"></span>
							{canStream(item)
								? powerStateLabel(item)
								: t('page.myConsoles.warningLabel')}
						</span>
					</div>

					<div class="console-device" aria-hidden="true">
						<div
							class="console-device-glyph"
							class:console-device-glyph-on={isConsoleReady(item) || wakingConsoleId === item.id}
						>
							<span class="console-device-bar"></span>
							<span class="console-device-bar"></span>
							<span class="console-device-bar"></span>
						</div>
					</div>

					<div class="console-actions">
						{#if canStream(item)}
							{#if canWake(item)}
								<Button
									label={wakingConsoleId === item.id
										? t('page.myConsoles.wakingBtn')
										: t('page.myConsoles.wakeBtn')}
									onclick={() => handleWake(item)}
									disabled={wakingConsoleId !== null}
									variant="secondary"
									size="sm"
									class="w-full"
								/>
								<Button
									label={wakingConsoleId === item.id
										? t('page.myConsoles.wakingBtn')
										: t('page.myConsoles.wakeAndStreamBtn')}
									onclick={() => handleWakeAndStream(item)}
									disabled={wakingConsoleId !== null}
									variant="solid"
									size="sm"
									class="w-full"
								/>
							{:else}
								<a href="/stream/{item.id}" class="block no-underline">
									<span class="glass-btn glass-btn-solid glass-btn-md w-full">
										<span class="glass-btn-shine" aria-hidden="true"></span>
										<span class="relative z-10">{t('page.myConsoles.startStreamBtn')}</span>
									</span>
								</a>
							{/if}
						{:else}
							<p class="text-xs text-white/40">
								{#if !item.remoteManagementEnabled}
									{t('page.myConsoles.managementWarning')}
								{:else}
									{t('page.myConsoles.streamingWarning')}
								{/if}
							</p>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	{/if}
</AppLayout>
