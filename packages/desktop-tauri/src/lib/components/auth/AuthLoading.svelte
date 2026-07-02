<script lang="ts">
	import AuthScreenBackdrop from '$lib/components/auth/AuthScreenBackdrop.svelte';
</script>

<svelte:head>
	<title>Blacklight Authenticating...</title>
</svelte:head>

<AuthScreenBackdrop>
	<main class="flex min-h-screen flex-1 items-center justify-center p-8">
		<div class="animate-fade-in-up text-center">
			<h2 class="mb-2 text-3xl font-bold text-white">Authenticating...</h2>
			<p class="text-base text-white/55">Welcome back...</p>
		</div>
	</main>
</AuthScreenBackdrop>