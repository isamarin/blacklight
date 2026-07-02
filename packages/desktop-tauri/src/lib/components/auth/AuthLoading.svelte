<svelte:head>
	<title>Blacklight Authenticating...</title>
</svelte:head>

<div class="flex h-screen bg-[#0d0d0d] bg-pattern overflow-hidden">
	<main class="flex-1 overflow-hidden relative">
		<div
			class="absolute top-0 right-0 w-96 h-96 bg-[#107C10]/3 rounded-full blur-3xl pointer-events-none"
		></div>
		<div
			class="absolute bottom-0 left-0 w-64 h-64 bg-[#107C10]/2 rounded-full blur-3xl pointer-events-none"
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