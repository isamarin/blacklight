<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/state';
	import type { StreamPlayerHandle, xCloudStreamConfig } from '@blacklight/player/client';
	import { startNativeGamepadBridge } from '$lib/gamepads';
	import { resolveAppErrorWithRegionHint } from '$lib/auth/region-hint-context';
	import { extractErrorMessage } from '$lib/errors';
	import { t } from '$lib/i18n';
	import { trpc } from '$lib/trpc';
	import { ensureConsoleAwake, isConsoleWakeTimeout } from '$lib/consoles';
	import { buildStreamConfig, parseStreamRoute } from '$lib/stream';
	import { createCommunicationHandler } from '$lib/stream/communication';
	import {
		getUserRefreshToken,
		getWebToken,
		getxCloudToken,
		getxHomeToken
	} from '$lib/stores/auth.svelte';
	import { getSettings } from '$lib/stores/settings.svelte';
	import ErrorPanel from '$lib/components/ui/ErrorPanel.svelte';
	import StreamOverlay from '$lib/components/stream/StreamOverlay.svelte';
	import StreamPreload from '$lib/components/stream/StreamPreload.svelte';
	import StreamPlayerHost from '$lib/components/stream/StreamPlayerHost.svelte';

	const STREAM_CONNECT_TIMEOUT_MS = 90_000;

	const serverid = $derived(page.params.serverid);
	const settings = $derived(getSettings());

	let streamConfig = $state<xCloudStreamConfig | undefined>();
	let session = $state<{ sessionId: string; sessionPath: string; state: string } | undefined>();
	let status = $state('');
	let errorCode = $state<import('$lib/errors').UserErrorCode | null>(null);
	let errorDetail = $state<string | null>(null);
	let errorRaw = $state<unknown>(null);
	let playerHandle = $state<StreamPlayerHandle | null>(null);
	let attempt = $state(0);
	let isConnecting = $state(true);
	let queueSeconds = $state(0);
	let micEnabled = $state(false);
	let connectTimeoutId: ReturnType<typeof setTimeout> | undefined;
	let stopGamepadBridge: (() => void) | undefined;

	function stopNativeGamepad() {
		stopGamepadBridge?.();
		stopGamepadBridge = undefined;
	}

	const showQueueOverlay = $derived(queueSeconds > 0 && !playerHandle);

	function clearConnectTimeout() {
		if (connectTimeoutId !== undefined) {
			clearTimeout(connectTimeoutId);
			connectTimeoutId = undefined;
		}
	}

	function armConnectTimeout() {
		isConnecting = true;
		clearConnectTimeout();
		connectTimeoutId = setTimeout(() => {
			if (!isConnecting) return;
			errorCode = 'stream_timeout';
			errorDetail = status;
			streamConfig = undefined;
			session = undefined;
		}, STREAM_CONNECT_TIMEOUT_MS);
	}

	function setStreamError(error: unknown) {
		isConnecting = false;
		errorRaw = error;
		errorCode = resolveAppErrorWithRegionHint(error);
		errorDetail = extractErrorMessage(error);
		streamConfig = undefined;
		session = undefined;
		clearConnectTimeout();
	}

	function handleStatusChanged(next: string) {
		status = next;
		if (next.startsWith('Error')) {
			isConnecting = false;
			errorCode = 'stream_failed';
			errorDetail = next.replace(/^Error:\s*/, '') || null;
			clearConnectTimeout();
		}
	}

	function handleQueueChanged(seconds: number) {
		if (seconds > 0) queueSeconds = seconds;
	}

	function handlePlayerReady(handle: StreamPlayerHandle) {
		playerHandle = handle;
		isConnecting = false;
		queueSeconds = 0;
		clearConnectTimeout();
		stopNativeGamepad();
		stopGamepadBridge = startNativeGamepadBridge(handle);
	}

	function retryStream() {
		errorCode = null;
		errorDetail = null;
		errorRaw = null;
		status = '';
		streamConfig = undefined;
		session = undefined;
		playerHandle = null;
		queueSeconds = 0;
		attempt += 1;
	}

	function leaveStream() {
		stopNativeGamepad();
		playerHandle = null;
		streamConfig = undefined;
		session = undefined;
		history.back();
	}

	onDestroy(() => {
		stopNativeGamepad();
		clearConnectTimeout();
	});

	function endStream() {
		if (confirm(t('streamWindow.endStreamConfirmMessage'))) {
			leaveStream();
		}
	}

	function disconnectStream() {
		leaveStream();
	}

	function toggleMic() {
		if (!playerHandle) return;
		try {
			micEnabled = playerHandle.toggleMic();
		} catch (e) {
			micEnabled = false;
			console.error('Microphone error:', extractErrorMessage(e));
		}
	}

	const parsed = $derived(serverid ? parseStreamRoute(serverid) : null);

	const communicationHandler = $derived.by(() => {
		if (!streamConfig || !session) return null;
		const token = streamConfig.type === 'cloud' ? getxCloudToken() : getxHomeToken();
		return createCommunicationHandler(
			token,
			streamConfig,
			session,
			getUserRefreshToken
		);
	});

	$effect(() => {
		if (!parsed) return;
		void attempt;

		let cancelled = false;
		errorCode = null;
		errorDetail = null;
		streamConfig = undefined;
		session = undefined;
		playerHandle = null;
		queueSeconds = 0;
		status = t('streamWindow.startingConnection');
		armConnectTimeout();

		const token = parsed.type === 'cloud' ? getxCloudToken() : getxHomeToken();
		const config = buildStreamConfig(
			parsed.id,
			parsed.type,
			settings.preferred_game_language,
			settings.app_lowresolution ? 720 : 1080,
			token.coreHost
		);

		if (!token.token) {
			setStreamError(new Error('streaming tokens missing'));
			return;
		}

		const startSession = () =>
			trpc.streaming_start_stream
				.mutate({ token, xCloudStreamConfig: config })
				.then((result) => {
					if (cancelled) return;
					if (!('sessionId' in result) || !('sessionPath' in result)) {
						throw new Error('Invalid stream session response');
					}
					streamConfig = config;
					session = {
						sessionId: result.sessionId,
						sessionPath: result.sessionPath,
						state: result.state ?? 'Provisioning'
					};
					status = t('streamWindow.connectingToConsole');
				});

		if (parsed.type === 'home') {
			const webToken = getWebToken();
			status = t('streamWindow.wakingConsole');
			ensureConsoleAwake(webToken, parsed.id)
				.catch((e: Error) => {
					if (cancelled) return;
					if (isConsoleWakeTimeout(e)) return;
					throw e;
				})
				.then(() => {
					if (cancelled) return;
					status = t('streamWindow.connectingToConsole');
					return startSession();
				})
				.catch((e: Error) => {
					if (!cancelled) setStreamError(e);
				});
		} else {
			startSession().catch((e: Error) => {
				if (!cancelled) setStreamError(e);
			});
		}

		return () => {
			cancelled = true;
			clearConnectTimeout();
		};
	});
</script>

{#if errorCode}
	<div class="h-screen bg-black flex items-center justify-center">
		<ErrorPanel
			code={errorCode}
			detail={errorDetail}
			rawError={errorRaw}
			onRetry={retryStream}
			onBack={() => history.back()}
		/>
	</div>
{:else if !communicationHandler}
	<div class="relative h-screen w-screen overflow-hidden bg-black">
		<StreamPreload
			{status}
			title={t('streamWindow.connectingToConsole')}
			onExit={leaveStream}
		/>
	</div>
{:else}
	<div class="relative h-screen w-screen overflow-hidden bg-black">
		{#key session?.sessionId}
			<StreamPlayerHost
				handler={communicationHandler}
				videoRenderer={settings.video_renderer}
				onStatusChanged={handleStatusChanged}
				onQueueChanged={handleQueueChanged}
				onReady={handlePlayerReady}
			/>
		{/key}
		{#if showQueueOverlay || (isConnecting && !playerHandle)}
			<StreamPreload
				waitingSeconds={queueSeconds}
				{status}
				title={t('streamWindow.connectingToConsole')}
				onExit={endStream}
			/>
		{:else if playerHandle}
			<StreamOverlay
				{status}
				{micEnabled}
				onToggleDebug={() => playerHandle?.toggleDebugOverlay()}
				onAttachGamepad={() => playerHandle?.attachGamepad(0)}
				onAttachMkb={() => playerHandle?.attachMouseKeyboard(0)}
				onPressMenu={() => playerHandle?.pressMenu()}
				onToggleMic={toggleMic}
				onEndStream={endStream}
				onDisconnect={disconnectStream}
				onExit={leaveStream}
			/>
		{/if}
	</div>
{/if}