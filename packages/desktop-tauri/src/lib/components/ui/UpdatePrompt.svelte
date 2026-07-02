<script lang="ts">
	import { t } from '$lib/i18n';
	import {
		downloadPendingUpdate,
		getPendingUpdate,
		getUpdateCurrentVersion,
		remindUpdateLater
	} from '$lib/stores/updater.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const release = $derived(getPendingUpdate());
	const installedVersion = $derived(getUpdateCurrentVersion());
</script>

{#if release && installedVersion}
	<div
		class="animate-overlay-in fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		role="presentation"
	>
		<div
			class="glass animate-dialog-in w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl"
			role="dialog"
			aria-labelledby="update-title"
			aria-describedby="update-body"
		>
			<h2 id="update-title" class="text-xl font-semibold text-white">
				{t('updater.newReleaseAvailable')}
			</h2>
			<p id="update-body" class="mt-3 text-sm leading-relaxed text-white/70">
				{t('updater.installedVersion')}
				{installedVersion}<br />
				{t('updater.latestVersion')}
				{release.tag_name}
			</p>
			{#if release.body?.trim()}
				<pre
					class="mt-4 max-h-40 overflow-auto rounded-xl border border-white/10 bg-black/20 p-3 text-xs whitespace-pre-wrap text-white/60"
				>{release.body.trim()}</pre>
			{/if}
			<div class="mt-6 flex flex-wrap justify-end gap-3">
				<Button label={t('updater.laterBtn')} variant="ghost" size="sm" onclick={remindUpdateLater} />
				<Button label={t('updater.downloadBtn')} size="sm" onclick={downloadPendingUpdate} />
			</div>
		</div>
	</div>
{/if}