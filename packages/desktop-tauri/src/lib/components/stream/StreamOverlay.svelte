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

	let statsOpen = $state(false);

	function toggleStats() {
		statsOpen = !statsOpen;
		// Player-native overlay (FPS/RTT/codec) — best-effort alongside our HUD panel
		try {
			onToggleDebug();
		} catch {
			// player may not be ready
		}
	}

	onMount(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key !== '~') return;
			event.preventDefault();
			toggleStats();
		}

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	});
</script>

<div class="stream-hud">
	<div class="stream-hud-top">
		<div class="stream-hud-status" title={status}>{status}</div>
		<Button label={t('streamWindow.exitBtn', { defaultValue: 'Exit' })} variant="ghost" size="sm" onclick={onExit} />
	</div>

	{#if statsOpen}
		<div class="stream-stats">
			<div class="stream-stats-title">{t('streamWindow.debugTitle')}</div>
			<div class="stream-stats-row">
				<span class="stream-stats-k">{t('streamWindow.statusLabel', { defaultValue: 'Status' })}</span>
				<span class="stream-stats-v">{status || '—'}</span>
			</div>
			<div class="stream-stats-row">
				<span class="stream-stats-k">{t('streamWindow.micLabel', { defaultValue: 'Mic' })}</span>
				<span class="stream-stats-v">
					{micEnabled ? t('streamWindow.micActive') : t('streamWindow.micMuted')}
				</span>
			</div>
			<p class="mt-2 text-[0.68rem] leading-snug text-white/40">
				{t('streamWindow.statsHint', {
					defaultValue: 'Player debug overlay toggled with ~'
				})}
			</p>
		</div>
	{/if}

	<div class="stream-hud-bar">
		<Button label={t('streamWindow.menuBtn')} variant="secondary" size="sm" onclick={onPressMenu} />
		<Button
			label={t('streamWindow.keyboardBtn', { defaultValue: 'Keyboard' })}
			variant="ghost"
			size="sm"
			onclick={onAttachMkb}
		/>
		<Button
			label={t('streamWindow.gamepadBtn', { defaultValue: 'Gamepad' })}
			variant="ghost"
			size="sm"
			onclick={onAttachGamepad}
		/>
		<Button
			label={micEnabled ? t('streamWindow.micActive') : t('streamWindow.micMuted')}
			variant={micEnabled ? 'primary' : 'ghost'}
			size="sm"
			class={micEnabled ? '' : 'opacity-70'}
			onclick={onToggleMic}
		/>
		<Button
			label={t('streamWindow.statsBtn', { defaultValue: 'Stats' })}
			variant={statsOpen ? 'primary' : 'ghost'}
			size="sm"
			onclick={toggleStats}
		/>
		<Button
			label={t('streamWindow.disconnectBtn')}
			variant="secondary"
			size="sm"
			onclick={onDisconnect}
		/>
		<Button label={t('streamWindow.endStreamBtn')} variant="danger" size="sm" onclick={onEndStream} />
	</div>
</div>
