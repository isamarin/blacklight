<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		status,
		onToggleDebug,
		onAttachGamepad,
		onAttachMkb,
		onExit
	}: {
		status: string;
		onToggleDebug: () => void;
		onAttachGamepad: () => void;
		onAttachMkb: () => void;
		onExit: () => void;
	} = $props();

	onMount(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key !== '~') return;
			event.preventDefault();
			onToggleDebug();
		}

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

<div class="absolute top-4 right-4 z-50 flex flex-col gap-2">
	<div class="glass px-3 py-1 rounded text-xs text-white/70">{status}</div>
	<div class="flex gap-2">
		<Button
			label={t('streamWindow.gamepadBtn', { defaultValue: 'Gamepad' })}
			onclick={onAttachGamepad}
			class="text-xs py-1 px-2"
		/>
		<Button
			label={t('streamWindow.keyboardBtn', { defaultValue: 'Keyboard' })}
			onclick={onAttachMkb}
			class="text-xs py-1 px-2"
		/>
		<Button
			label={t('streamWindow.debugBtn', { defaultValue: 'Debug (~)' })}
			onclick={onToggleDebug}
			class="text-xs py-1 px-2"
		/>
		<Button
			label={t('streamWindow.exitBtn', { defaultValue: 'Exit' })}
			onclick={onExit}
			class="text-xs py-1 px-2 bg-red-800"
		/>
	</div>
</div>