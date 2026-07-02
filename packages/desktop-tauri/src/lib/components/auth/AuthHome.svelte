<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import type { RouterOutputs } from '$lib/trpc';
	import { classifyError, errorI18nKey } from '$lib/errors';
	import { t } from '$lib/i18n';
	import {
		clearAppData,
		clearAuthError,
		getAuthError,
		startAuth,
		verifyCode
	} from '$lib/stores/auth.svelte';
	import { getApiHealth, openExternal } from '$lib/runtime';
	import AuthScreenBackdrop from '$lib/components/auth/AuthScreenBackdrop.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import CopyableCode from '$lib/components/ui/CopyableCode.svelte';

	let authFlow = $state<RouterOutputs['auth_msal_start'] | undefined>();
	let error = $state<string | null>(null);
	let qrDataUrl = $state<string | null>(null);

	async function handleClearData() {
		if (!confirm(t('auth.clearDataQuestion'))) return;
		await clearAppData();
	}

	async function openMicrosoftLogin(event: MouseEvent, url: string) {
		event.preventDefault();
		await openExternal(url);
	}

	function displayUrl(url: string): string {
		return url.replace(/^https?:\/\//, '');
	}

	async function beginAuthFlow() {
		error = null;
		authFlow = undefined;
		qrDataUrl = null;
		clearAuthError();

		if (!(await getApiHealth())) {
			error = t('errors.codes.network');
			return;
		}

		try {
			const flow = await startAuth();
			if (!flow) return;
			authFlow = flow;
			await verifyCode(flow.device_code);
		} catch (e: unknown) {
			const authErr = getAuthError();
			error = authErr
				? t(errorI18nKey(authErr))
				: t(errorI18nKey(classifyError(e)));
		}
	}

	onMount(() => {
		let cancelled = false;

		beginAuthFlow().catch((e: Error) => {
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

<AuthScreenBackdrop>
	<main class="flex min-h-screen flex-1 items-center justify-center p-8">
		<div class="glass-auth max-w-lg w-full rounded-2xl p-8 shadow-2xl shadow-black/30">
			<h2 class="text-3xl font-bold text-white mb-2 text-center">{t('auth.loginWithXbox')}</h2>
			<p class="text-white/40 text-base mb-6 text-center">{t('auth.pleaseAuthenticate')}</p>
			{#if error}
				<div class="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
					<p class="text-red-400 text-base">{error}</p>
					<div class="mt-3">
						<Button label={t('errors.retryBtn')} onclick={beginAuthFlow} size="sm" />
					</div>
				</div>
			{/if}
			{#if authFlow?.verification_uri && authFlow?.user_code}
				{@const loginUrl = authFlow.verification_uri}
				<p class="text-white/80 text-base mb-4">
					{t('auth.deviceLoginHint')}
					<a
						href={loginUrl}
						onclick={(event) => openMicrosoftLogin(event, loginUrl)}
						class="text-sky-400 hover:text-sky-300 underline break-all"
						title={t('auth.microsoftLinkTitle')}
					>
						{displayUrl(loginUrl)}
					</a>
				</p>
				<div class="flex flex-col items-center gap-4">
					<p class="text-white/50 text-base text-center">{t('auth.qrCodeHint')}</p>
					{#if qrDataUrl}
						<img src={qrDataUrl} alt="Login QR code" width="120" height="120" />
					{/if}
					<CopyableCode code={authFlow.user_code} />
				</div>
			{:else if !error}
				<p class="text-white/80 text-base mb-4">{t('auth.loggingIn')}</p>
			{/if}
			<div class="mt-6 pt-4 border-t border-white/10">
				<Button label={t('auth.clearDataBtn')} onclick={handleClearData} variant="white" size="sm" />
			</div>
		</div>
	</main>
</AuthScreenBackdrop>