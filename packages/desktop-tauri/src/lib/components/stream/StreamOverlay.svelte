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

<div class="absolute top-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] flex-col gap-2">
	<div class="glass truncate rounded-lg px-3 py-1 text-xs text-white/70">{status}</div>
	<div class="flex flex-wrap justify-end gap-2">
		<Button label={t('streamWindow.endStreamBtn')} variant="danger" size="sm" onclick={onEndStream} />
		<Button
			label={t('streamWindow.disconnectBtn')}
			variant="secondary"
			size="sm"
			onclick={onDisconnect}
		/>
		<Button label={t('streamWindow.menuBtn')} variant="secondary" size="sm" onclick={onPressMenu} />
		<Button
			label={micEnabled ? t('streamWindow.micActive') : t('streamWindow.micMuted')}
			variant="ghost"
			size="sm"
			class={micEnabled ? '' : 'opacity-60'}
			onclick={onToggleMic}
		/>
	</div>
	<div class="flex flex-wrap justify-end gap-2">
		<Button
			label={t('streamWindow.gamepadBtn', { defaultValue: 'Gamepad' })}
			variant="ghost"
			size="sm"
			onclick={onAttachGamepad}
		/>
		<Button
			label={t('streamWindow.keyboardBtn', { defaultValue: 'Keyboard' })}
			variant="ghost"
			size="sm"
			onclick={onAttachMkb}
		/>
		<Button
			label={t('streamWindow.debugBtn', { defaultValue: 'Debug (~)' })}
			variant="ghost"
			size="sm"
			onclick={onToggleDebug}
		/>
		<Button label={t('streamWindow.exitBtn', { defaultValue: 'Exit' })} variant="danger" size="sm" onclick={onExit} />
	</div>
</div>