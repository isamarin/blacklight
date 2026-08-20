<script lang="ts">
	import { cardGlow } from '$lib/actions/card-glow';
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
			width: 148,
			margin: 1,
			color: { dark: '#f5f5f2', light: '#0a0a0a' }
		}).then((url) => {
			qrDataUrl = url;
		});
	});
</script>

<svelte:head>
	<title>{t('auth.windowTitle')}</title>
</svelte:head>

<AuthScreenBackdrop>
	<main class="relative z-[1] flex min-h-screen flex-1 items-center justify-center p-6 sm:p-8">
		<div use:cardGlow class="glass-auth card-glow w-full max-w-[28rem] rounded-2xl px-8 py-10">
			<div class="relative z-[1] flex flex-col items-center gap-6">
				<div class="auth-brand">
					<div class="auth-brand-row">
						<div class="auth-brand-mark" aria-hidden="true">bl</div>
						<div class="auth-brand-title">BLACKLIGHT</div>
					</div>
					<div class="auth-brand-sub">xHome + xCloud Streaming</div>
				</div>

				<p class="text-center text-[0.82rem] leading-relaxed text-white/80">
					{t('auth.pleaseAuthenticate')}
				</p>

				{#if error}
					<div class="w-full rounded-xl border border-red-500/30 bg-red-500/10 p-3">
						<p class="text-sm text-red-400">{error}</p>
						<div class="mt-3">
							<Button label={t('errors.retryBtn')} onclick={beginAuthFlow} size="sm" />
						</div>
					</div>
				{/if}

				{#if authFlow?.verification_uri && authFlow?.user_code}
					{@const loginUrl = authFlow.verification_uri}
					<div class="flex w-full flex-col items-center gap-4">
						{#if qrDataUrl}
							<div class="auth-qr-frame">
								<img src={qrDataUrl} alt="Login QR code" width="148" height="148" />
							</div>
						{/if}
						<p class="text-center text-xs font-medium text-white/75">{t('auth.qrCodeHint')}</p>
						<CopyableCode code={authFlow.user_code} />
						<p class="text-center text-xs text-white/70">
							{t('auth.deviceLoginHint')}
							<a
								href={loginUrl}
								onclick={(event) => openMicrosoftLogin(event, loginUrl)}
								class="text-white underline decoration-white/40 underline-offset-2 transition-colors hover:text-xbox-glow"
								title={t('auth.microsoftLinkTitle')}
							>
								{displayUrl(loginUrl)}
							</a>
						</p>
						<a
							href={loginUrl}
							onclick={(event) => openMicrosoftLogin(event, loginUrl)}
							class="glass-btn glass-btn-solid glass-btn-md w-full no-underline"
							title={t('auth.microsoftLinkTitle')}
						>
							<span class="glass-btn-shine" aria-hidden="true"></span>
							<span class="relative z-10">{t('auth.loginBtn')}</span>
						</a>
					</div>
				{:else if !error}
					<p class="text-sm text-white/70">{t('auth.loggingIn')}</p>
				{/if}

				<div class="w-full border-t border-white/10 pt-4">
					<Button
						label={t('auth.clearDataBtn')}
						onclick={handleClearData}
						variant="ghost"
						size="sm"
						class="w-full"
					/>
				</div>
			</div>
		</div>
	</main>
</AuthScreenBackdrop>
