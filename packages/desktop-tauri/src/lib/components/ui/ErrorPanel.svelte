<script lang="ts">
	import { errorI18nKey, type UserErrorCode } from '$lib/errors';
	import { t } from '$lib/i18n';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		code,
		detail = null,
		onRetry,
		onBack
	}: {
		code: UserErrorCode;
		detail?: string | null;
		onRetry?: () => void;
		onBack?: () => void;
	} = $props();
</script>

<div class="flex flex-col items-center justify-center gap-4 p-8 text-center">
	<p class="text-red-400 text-sm max-w-md">{t(errorI18nKey(code))}</p>
	{#if detail}
		<p class="text-white/30 text-xs max-w-md break-words">{detail}</p>
	{/if}
	<div class="flex flex-wrap items-center justify-center gap-3">
		{#if onRetry}
			<Button label={t('errors.retryBtn')} onclick={onRetry} />
		{/if}
		{#if onBack}
			<button class="text-white/60 text-sm underline hover:text-white" onclick={onBack}>
				{t('errors.goBackBtn')}
			</button>
		{/if}
	</div>
</div>