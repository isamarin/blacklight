<script lang="ts">
	import { onDestroy } from 'svelte';
	import { t } from '$lib/i18n';
	import { formatWaitingTime } from '$lib/stream/formatWaitingTime';
	import Card from '$lib/components/ui/Card.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		waitingSeconds = 0,
		status = '',
		onExit
	}: {
		waitingSeconds?: number;
		status?: string;
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

<div class="absolute inset-0 z-40 flex items-center justify-center bg-black/90 p-6">
	<Card class="max-w-md w-full text-center">
		<h1 class="text-xl font-bold text-white mb-4">{t('streamWindow.loadingStreamTitle')}</h1>
		<Loader />
		<p class="text-white/70 text-sm mt-4">{t('streamWindow.gettingStreamReadyMessage')}</p>
		{#if status}
			<p class="text-white/50 text-xs mt-2">{status}</p>
		{/if}
		{#if formattedQueue}
			<p class="text-white/60 text-sm mt-4">
				{t('streamWindow.estimatedWaitingTimeMessage')}
				<span class="text-white font-medium">{formattedQueue}</span>
			</p>
		{:else if countdown === 0 && waitingSeconds > 0}
			<p class="text-white/50 text-sm mt-4">{t('streamWindow.itsTakingALittleLonger')}</p>
		{/if}
		<div class="mt-6">
			<Button
				label={t('streamWindow.endStreamBtn')}
				onclick={onExit}
				class="text-sm bg-red-900 hover:bg-red-800"
			/>
		</div>
	</Card>
</div>