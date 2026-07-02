<script lang="ts">
	import { page } from '$app/state';
	import type { StreamPlayerHandle, xCloudStreamConfig } from '@blacklight/player/client';
	import { trpc } from '$lib/trpc';
	import { buildStreamConfig, parseStreamRoute } from '$lib/stream';
	import { createCommunicationHandler } from '$lib/stream/communication';
	import {
		getUserRefreshToken,
		getxCloudToken,
		getxHomeToken
	} from '$lib/stores/auth.svelte';
	import { getSettings } from '$lib/stores/settings.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';
	import StreamOverlay from '$lib/components/stream/StreamOverlay.svelte';
	import StreamPlayerHost from '$lib/components/stream/StreamPlayerHost.svelte';

	const serverid = $derived(page.params.serverid);
	const settings = $derived(getSettings());

	let streamConfig = $state<xCloudStreamConfig | undefined>();
	let session = $state<{ sessionId: string; sessionPath: string; state: string } | undefined>();
	let status = $state('Starting...');
	let error = $state<string | null>(null);
	let playerHandle = $state<StreamPlayerHandle | null>(null);

	function handleStatusChanged(next: string) {
		status = next;
	}

	function handlePlayerReady(handle: StreamPlayerHandle) {
		playerHandle = handle;
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

		let cancelled = false;
		error = null;
		streamConfig = undefined;
		session = undefined;
		status = 'Starting...';

		const config = buildStreamConfig(
			parsed.id,
			parsed.type,
			settings.preferred_game_language,
			settings.app_lowresolution ? 720 : 1080
		);
		const token = parsed.type === 'cloud' ? getxCloudToken() : getxHomeToken();

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
				status = 'Connecting...';
			})
			.catch((e: Error) => {
				if (!cancelled) error = e?.message || 'Failed to start stream';
			});

		return () => {
			cancelled = true;
		};
	});
</script>

{#if error}
	<div class="h-screen bg-black flex items-center justify-center text-red-400">
		{error}
		<button class="ml-4 text-white underline" onclick={() => history.back()}>Go back</button>
	</div>
{:else if !communicationHandler}
	<div class="h-screen bg-black flex items-center justify-center">
		<Loader />
	</div>
{:else}
	<div class="relative h-screen w-screen bg-black overflow-hidden">
		{#key session?.sessionId}
			<StreamPlayerHost
				handler={communicationHandler}
				videoRenderer={settings.video_renderer}
				onStatusChanged={handleStatusChanged}
				onReady={handlePlayerReady}
			/>
		{/key}
		<StreamOverlay
			{status}
			onToggleDebug={() => playerHandle?.toggleDebugOverlay()}
			onAttachGamepad={() => playerHandle?.attachGamepad(0)}
			onAttachMkb={() => playerHandle?.attachMouseKeyboard(0)}
			onExit={() => history.back()}
		/>
	</div>
{/if}