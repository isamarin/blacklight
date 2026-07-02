<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import type { RouterOutputs } from '$lib/trpc';
	import { errorI18nKey } from '$lib/errors';
	import { t } from '$lib/i18n';
	import {
		clearAppData,
		clearAuthError,
		getAuthError,
		retryStoredAuth,
		startAuth,
		verifyCode
	} from '$lib/stores/auth.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let authFlow = $state<RouterOutputs['auth_msal_start'] | undefined>();
	let error = $state<string | null>(null);
	let qrDataUrl = $state<string | null>(null);
	let flowStarted = $state(false);

	async function handleClearData() {
		if (!confirm(t('auth.clearDataQuestion'))) return;
		await clearAppData();
	}

	async function beginAuthFlow() {
		flowStarted = true;
		error = null;
		clearAuthError();

		try {
			const flow = await startAuth();
			if (!flow) return;
			authFlow = flow;
			await verifyCode(flow.device_code);
		} catch (e: unknown) {
			const authErr = getAuthError();
			error = authErr ? t(errorI18nKey(authErr)) : (e as Error)?.message || t('errors.codes.unknown');
		}
	}

	onMount(() => {
		let cancelled = false;

		retryStoredAuth()
			.then((restored) => {
				if (cancelled || restored) return;
				return beginAuthFlow();
			})
			.catch((e: Error) => {
				if (!cancelled) error = e?.message || t('errors.codes.unknown');
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
	<title>{t('auth.windowTitle')}</title>
</svelte:head>

<div class="flex h-screen bg-[#0d0d0d] bg-pattern overflow-hidden">
	<main class="flex-1 flex items-center justify-center p-8">
		<div class="max-w-lg w-full glass rounded-2xl p-8 border border-white/5">
			<h2 class="text-2xl font-bold text-white mb-2">{t('auth.loginWithXbox')}</h2>
			<p class="text-white/40 text-sm mb-6">{t('auth.pleaseAuthenticate')}</p>
			{#if error}
				<div class="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
					<p class="text-red-400 text-sm">{error}</p>
					<div class="mt-3">
						<Button label={t('errors.retryBtn')} onclick={beginAuthFlow} class="text-xs py-1 px-3" />
					</div>
				</div>
			{/if}
			<p class="text-white/80 mb-4">
				{authFlow?.message || (flowStarted ? t('auth.loggingIn') : t('auth.loggingIn'))}
			</p>
			{#if authFlow?.verification_uri && authFlow?.user_code}
				<div class="flex flex-col items-center gap-4">
					<p class="text-white/50 text-sm text-center">{t('auth.qrCodeHint')}</p>
					{#if qrDataUrl}
						<img src={qrDataUrl} alt="Login QR code" width="120" height="120" />
					{/if}
					<p class="text-white font-mono text-lg tracking-widest">{authFlow.user_code}</p>
				</div>
			{/if}
			<div class="mt-6 pt-4 border-t border-white/10">
				<Button label={t('auth.clearDataBtn')} onclick={handleClearData} class="text-sm" />
			</div>
		</div>
	</main>
</div>