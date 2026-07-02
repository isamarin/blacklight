<script lang="ts">
	import { onMount } from 'svelte';
	import { trpc } from '$lib/trpc';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import SettingsSidebar from '$lib/components/settings/SettingsSidebar.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let ping = $state<string | undefined>();
	let version = $state<string | undefined>();

	onMount(async () => {
		try {
			[ping, version] = await Promise.all([trpc.ping.query(), trpc.version.query()]);
		} catch (e) {
			console.error('Debug queries failed', e);
		}
	});
</script>

<AppLayout title="Debug">
	<div class="flex gap-8">
		<SettingsSidebar />
		<div class="flex-1 space-y-4">
			<Card>
				<h2 class="text-white font-semibold mb-2">Platform</h2>
				<p class="text-white/60 text-sm">Ping: {ping}</p>
				<p class="text-white/60 text-sm">Version: {version}</p>
			</Card>
			<Card>
				<h2 class="text-white font-semibold mb-2">Environment</h2>
				<pre class="text-xs text-white/50 overflow-auto">
{JSON.stringify(
	{
		userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
		platform: 'web'
	},
	null,
	2
)}
				</pre>
			</Card>
		</div>
	</div>
</AppLayout>