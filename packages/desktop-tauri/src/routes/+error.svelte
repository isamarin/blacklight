<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n';
</script>

<div class="flex h-screen bg-[#0d0d0d] items-center justify-center">
	<div class="text-center">
		<h1 class="text-4xl font-bold text-white mb-2">{page.status}</h1>
		<p class="text-white/50 mb-6">
			{t('errors.pageNotFound', { defaultValue: 'Page not found' })}
		</p>
		<a href="/home" class="text-[#107C10] hover:underline">Go home</a>
	</div>
</div>