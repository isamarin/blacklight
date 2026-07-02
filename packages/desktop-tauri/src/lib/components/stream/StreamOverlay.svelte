<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		status,
		micEnabled = false,
		onToggleDebug,
		onAttachGamepad,
		onAttachMkb,
		onPressMenu,
		onToggleMic,
		onEndStream,
		onDisconnect,
		onExit
	}: {
		status: string;
		micEnabled?: boolean;
		onToggleDebug: () => void;
		onAttachGamepad: () => void;
		onAttachMkb: () => void;
		onPressMenu: () => void;
		onToggleMic: () => void;
		onEndStream: () => void;
		onDisconnect: () => void;
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

<div class="absolute top-4 right-4 z-50 flex flex-col gap-2 max-w-[calc(100vw-2rem)]">
	<div class="glass px-3 py-1 rounded text-xs text-white/70 truncate">{status}</div>
	<div class="flex flex-wrap gap-2 justify-end">
		<Button
			label={t('streamWindow.endStreamBtn')}
			onclick={onEndStream}
			class="text-xs py-1 px-2 bg-red-900 hover:bg-red-800"
		/>
		<Button
			label={t('streamWindow.disconnectBtn')}
			onclick={onDisconnect}
			class="text-xs py-1 px-2"
		/>
		<Button
			label={t('streamWindow.menuBtn')}
			onclick={onPressMenu}
			class="text-xs py-1 px-2"
		/>
		<Button
			label={micEnabled ? t('streamWindow.micActive') : t('streamWindow.micMuted')}
			onclick={onToggleMic}
			class="text-xs py-1 px-2 {micEnabled ? '' : 'opacity-60'}"
		/>
	</div>
	<div class="flex flex-wrap gap-2 justify-end">
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