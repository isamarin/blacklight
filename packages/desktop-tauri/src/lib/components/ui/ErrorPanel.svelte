<script lang="ts">
	import RegionIpHint from '$lib/components/ui/RegionIpHint.svelte';
	import { buildRegionHintContext } from '$lib/auth/region-hint-context';
	import { shouldSuggestRegionIpFix } from '$lib/auth/region-hint';
	import { errorI18nKey, type UserErrorCode } from '$lib/errors';
	import { t } from '$lib/i18n';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		code,
		detail = null,
		rawError = null,
		onRetry,
		onBack
	}: {
		code: UserErrorCode;
		detail?: string | null;
		rawError?: unknown;
		onRetry?: () => void;
		onBack?: () => void;
	} = $props();

	const showRegionHint = $derived(
		shouldSuggestRegionIpFix(code, rawError, buildRegionHintContext())
	);
</script>

<div class="glass mx-auto flex max-w-lg flex-col items-center justify-center gap-4 rounded-2xl p-8 text-center">
	<p class="max-w-md text-sm text-red-400">{t(errorI18nKey(code))}</p>
	{#if detail}
		<p class="max-w-md break-words text-xs text-white/30">{detail}</p>
	{/if}
	{#if showRegionHint}
		<RegionIpHint />
	{/if}
	<div class="flex flex-wrap items-center justify-center gap-3">
		{#if onRetry}
			<Button label={t('errors.retryBtn')} onclick={onRetry} size="sm" />
		{/if}
		{#if onBack}
			<button class="transition-soft text-sm text-white/60 underline hover:text-white" onclick={onBack}>
				{t('errors.goBackBtn')}
			</button>
		{/if}
	</div>
</div>