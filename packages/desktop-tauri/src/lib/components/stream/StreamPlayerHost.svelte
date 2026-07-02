<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { createElement } from 'react';
	import { createRoot, type Root } from 'react-dom/client';
	import {
		StreamPlayer,
		type StreamPlayerHandle,
		type communicationHandler as CommunicationHandler,
		type VideoRendererMode
	} from '@blacklight/player/client';
	import '@blacklight/player/client.css';

	let {
		handler,
		videoRenderer = 'auto',
		onStatusChanged,
		onQueueChanged,
		onReady
	}: {
		handler: CommunicationHandler;
		videoRenderer?: VideoRendererMode;
		onStatusChanged: (status: string) => void;
		onQueueChanged?: (seconds: number) => void;
		onReady: (handle: StreamPlayerHandle) => void;
	} = $props();

	let mountEl: HTMLDivElement;
	let root: Root | undefined;

	onMount(() => {
		root = createRoot(mountEl);
		root.render(
			createElement(StreamPlayer, {
				ref: (handle: StreamPlayerHandle | null) => {
					if (handle) onReady(handle);
				},
				communicationHandler: handler,
				videoRenderer,
				onStatusChanged,
				onQueueChanged
			})
		);
	});

	onDestroy(() => {
		root?.unmount();
		root = undefined;
	});
</script>

<div class="relative h-screen w-screen bg-black overflow-hidden" bind:this={mountEl}></div>