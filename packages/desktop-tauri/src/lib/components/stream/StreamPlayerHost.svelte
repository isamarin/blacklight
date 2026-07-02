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
		onReady
	}: {
		handler: CommunicationHandler;
		videoRenderer?: VideoRendererMode;
		onStatusChanged: (status: string) => void;
		onReady: (handle: StreamPlayerHandle) => void;
	} = $props();

	let container: HTMLDivElement;
	let root: Root | undefined;
	let playerRef: StreamPlayerHandle | null = null;

	onMount(() => {
		root = createRoot(container);
		root.render(
			createElement(StreamPlayer, {
				ref: (handle: StreamPlayerHandle | null) => {
					playerRef = handle;
					if (handle) onReady(handle);
				},
				communicationHandler: handler,
				videoRenderer,
				onStatusChanged
			})
		);
	});

	onDestroy(() => {
		root?.unmount();
	});

	$effect(() => {
		if (!root) return;
		root.render(
			createElement(StreamPlayer, {
				ref: (handle: StreamPlayerHandle | null) => {
					playerRef = handle;
					if (handle) onReady(handle);
				},
				communicationHandler: handler,
				videoRenderer,
				onStatusChanged
			})
		);
	});
</script>

<div class="relative h-screen w-screen bg-black overflow-hidden" bind:this={container}></div>