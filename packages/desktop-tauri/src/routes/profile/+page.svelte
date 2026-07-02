<script lang="ts">
	import { t } from '$lib/i18n';
	import { getAuthState } from '$lib/stores/auth.svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	type XboxProfile = {
		gtg?: string;
		xid?: string;
	};

	const authState = $derived(getAuthState());
	const profile = $derived(
		authState.webToken?.data.DisplayClaims?.xui?.[0] as XboxProfile | undefined
	);
</script>

<AppLayout title={t('page.profile.pageTitle')}>
	<Card>
		<h1 class="text-xl font-bold text-white">{profile?.gtg || t('page.profile.pageTitle')}</h1>
		<p class="text-white/50 text-sm mt-2">
			{t('page.profile.xuidLabel')}: {profile?.xid || '—'}
		</p>
		<p class="text-white/40 text-sm mt-4">
			{t('page.profile.comingSoon')}
		</p>
	</Card>
</AppLayout>