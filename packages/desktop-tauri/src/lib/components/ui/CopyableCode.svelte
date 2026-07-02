<script lang="ts">
	import { t } from '$lib/i18n';

	let { code }: { code: string } = $props();

	let copied = $state(false);
	let copyResetId: ReturnType<typeof setTimeout> | undefined;

	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			if (copyResetId) clearTimeout(copyResetId);
			copyResetId = setTimeout(() => {
				copied = false;
			}, 1500);
		} catch {
			copied = false;
		}
	}
</script>

<div class="glass-control relative w-full max-w-sm px-4 py-3 pr-12">
	<span class="block w-full text-center font-mono text-xl tracking-[0.3em] text-white select-all">
		{code}
	</span>
	<button
		type="button"
		onclick={copyCode}
		class="transition-soft absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
		aria-label={copied ? t('auth.codeCopied') : t('auth.copyCode')}
		title={copied ? t('auth.codeCopied') : t('auth.copyCode')}
	>
		{#if copied}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-5 w-5"
				aria-hidden="true"
			>
				<path d="M20 6 9 17l-5-5" />
			</svg>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-5 w-5"
				aria-hidden="true"
			>
				<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
				<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
			</svg>
		{/if}
	</button>
</div>