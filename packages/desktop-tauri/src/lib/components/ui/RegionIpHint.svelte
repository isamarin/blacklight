<script lang="ts">
	import { t } from '$lib/i18n';
</script>

<div class="max-w-md rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-left">
	<p class="text-sm text-amber-200/90">{t('errors.regionIpHint.title')}</p>
	<p class="mt-2 text-xs text-white/50">{t('errors.regionIpHint.body')}</p>
	<a
		href="/settings/streaming"
		class="mt-3 inline-block text-xs font-medium text-amber-200 underline hover:text-amber-100"
	>
		{t('errors.regionIpHint.openSettings')}
	</a>
</div>