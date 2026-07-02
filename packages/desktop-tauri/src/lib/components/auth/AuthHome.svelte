<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import type { RouterOutputs } from '$lib/trpc';
	import { startAuth, verifyCode } from '$lib/stores/auth.svelte';

	let authFlow = $state<RouterOutputs['auth_msal_start'] | undefined>();
	let error = $state<string | null>(null);
	let qrDataUrl = $state<string | null>(null);

	onMount(() => {
		let cancelled = false;

		startAuth()
			.then(async (flow) => {
				if (cancelled || !flow) return;
				authFlow = flow;
				await verifyCode(flow.device_code);
			})
			.catch((e: Error) => {
				if (!cancelled) error = e?.message || 'Authentication failed';
			});

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (!authFlow?.verification_uri || !authFlow?.user_code) {
			qrDataUrl = null;
			return;
		}
		QRCode.toDataURL(`${authFlow.verification_uri}?otc=${authFlow.user_code}`, {
			width: 120,
			color: { dark: '#ffffff', light: '#0d0d0d' }
		}).then((url) => {
			qrDataUrl = url;
		});
	});
</script>

<svelte:head>
	<title>Blacklight Authentication</title>
</svelte:head>

<div class="flex h-screen bg-[#0d0d0d] bg-pattern overflow-hidden">
	<main class="flex-1 flex items-center justify-center p-8">
		<div class="max-w-lg w-full glass rounded-2xl p-8 border border-white/5">
			<h2 class="text-2xl font-bold text-white mb-2">Sign in with Xbox</h2>
			<p class="text-white/40 text-sm mb-6">Login with your Xbox account to continue</p>
			{#if error}
				<p class="text-red-400 text-sm mb-4">{error}</p>
			{/if}
			<p class="text-white/80 mb-4">{authFlow?.message || 'Retrieving login details...'}</p>
			{#if authFlow?.verification_uri && authFlow?.user_code}
				<div class="flex flex-col items-center gap-4">
					<p class="text-white/50 text-sm text-center">Or scan the QR code with your phone</p>
					{#if qrDataUrl}
						<img src={qrDataUrl} alt="Login QR code" width="120" height="120" />
					{/if}
				</div>
			{/if}
		</div>
	</main>
</div>