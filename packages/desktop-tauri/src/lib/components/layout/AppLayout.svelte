<script lang="ts">
	import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
	import FriendsList from '$lib/components/sidebar/FriendsList.svelte';

	let { title, children }: { title?: string; children: import('svelte').Snippet } = $props();
</script>

<svelte:head>
	<title>{title ? `Blacklight - ${title}` : 'Blacklight'}</title>
</svelte:head>

<div class="flex h-screen bg-[#0d0d0d] bg-pattern overflow-hidden">
	<Sidebar />
	<main class="flex-1 overflow-hidden relative flex">
		<div class="flex-1 overflow-y-auto">
			<div
				class="absolute top-0 right-0 w-96 h-96 bg-[#107C10]/3 rounded-full blur-3xl pointer-events-none"
			></div>
			<div class="p-6 md:p-8 max-w-6xl mx-auto">
				{@render children()}
			</div>
		</div>
		<FriendsList />
	</main>
</div>