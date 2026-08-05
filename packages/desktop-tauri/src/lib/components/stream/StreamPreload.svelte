<script lang="ts">
	import { onDestroy } from 'svelte';
	import { t } from '$lib/i18n';
	import { formatWaitingTime } from '$lib/stream/formatWaitingTime';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		waitingSeconds = 0,
		status = '',
		title = '',
		onExit
	}: {
		waitingSeconds?: number;
		status?: string;
		title?: string;
		onExit: () => void;
	} = $props();

	let countdown = $state(Math.max(0, waitingSeconds));
	let tickId: ReturnType<typeof setInterval> | undefined;

	$effect(() => {
		countdown = Math.max(0, waitingSeconds);
	});

	$effect(() => {
		clearInterval(tickId);
		if (countdown <= 0) return;

		tickId = setInterval(() => {
			if (countdown > 0) countdown -= 1;
		}, 1000);

		return () => clearInterval(tickId);
	});

	onDestroy(() => clearInterval(tickId));

	const formattedQueue = $derived(
		countdown > 0
			? formatWaitingTime(countdown, {
					hours: t('streamWindow.timeHours'),
					minutes: t('streamWindow.timeMinutes'),
					seconds: t('streamWindow.timeSeconds')
				})
			: null
	);
</script>

<div class="stream-connect">
	<div class="stream-connect-orb" aria-hidden="true"></div>
	<div class="stream-connect-spinner" aria-hidden="true"></div>
	<h1 class="stream-connect-title">
		{title || t('streamWindow.loadingStreamTitle')}
	</h1>
	<p class="stream-connect-status">
		{status || t('streamWindow.gettingStreamReadyMessage')}
	</p>
	{#if formattedQueue}
		<p class="stream-connect-queue">
			{t('streamWindow.estimatedWaitingTimeMessage')}
			<span class="font-medium text-white">{formattedQueue}</span>
		</p>
	{:else if countdown === 0 && waitingSeconds > 0}
		<p class="stream-connect-status">{t('streamWindow.itsTakingALittleLonger')}</p>
	{/if}
	<div class="relative mt-2">
		<Button label={t('streamWindow.endStreamBtn')} variant="danger" size="sm" onclick={onExit} />
	</div>
</div>
