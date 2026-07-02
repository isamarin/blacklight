<svelte:head>
	<title>Blacklight Authenticating...</title>
</svelte:head>

<div
	class="flex h-full min-h-screen bg-[#0d0d0d] bg-pattern overflow-hidden"
	style="background: #0d0d0d; color: #fff"
>
	<main class="flex-1 overflow-hidden relative">
		<div
			class="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-xbox/10 blur-3xl"
		></div>
		<div
			class="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-xbox/5 blur-3xl"
		></div>
		<div class="h-full overflow-y-auto">
			<div class="p-6 md:p-8 max-w-5xl mx-auto">
				<div class="mb-6 animate-fade-in-up">
					<h2 class="text-2xl font-bold text-white mb-1">Authenticating...</h2>
					<p class="text-white/40 text-sm">Welcome back...</p>
				</div>
			</div>
		</div>
	</main>
</div>