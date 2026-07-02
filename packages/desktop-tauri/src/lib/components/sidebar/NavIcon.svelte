<script lang="ts">
	let { name }: { name: 'home' | 'consoles' | 'library' | 'settings' | 'profile' } = $props();
</script>

{#if name === 'home'}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
		<path
			d="M4 8.5 12 3l8 5.5V19a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19V8.5Z"
			stroke-linejoin="round"
		/>
		<path d="M9.5 20.5V13h5v7.5" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{:else if name === 'consoles'}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
		<path
			d="M7.5 14.5h9M8 18.5h8M6 6.5h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{:else if name === 'library'}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
		<path d="M4 6.5h5v11H4v-11ZM10 6.5h5v11h-5v-11ZM16 6.5h4v11h-4v-11Z" stroke-linejoin="round" />
	</svg>
{:else if name === 'profile'}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
		<path
			d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M5.5 20.25a6.5 6.5 0 0 1 13 0"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{:else}
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
		<path
			d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M19.4 15a7.9 7.9 0 0 0 .1-1 7.9 7.9 0 0 0-.1-1l2-1.5a.5.5 0 0 0 .1-.6l-1.9-3.3a.5.5 0 0 0-.5-.2l-2.4 1a7.2 7.2 0 0 0-1.7-1L15.5 3.6a.5.5 0 0 0-.5-.4h-3.8a.5.5 0 0 0-.5.4l-.4 2.5a7.2 7.2 0 0 0-1.7 1l-2.4-1a.5.5 0 0 0-.5.2L2.5 9.9a.5.5 0 0 0 .1.6l2 1.5a7.9 7.9 0 0 0-.1 1 7.9 7.9 0 0 0 .1 1l-2 1.5a.5.5 0 0 0-.1.6l1.9 3.3a.5.5 0 0 0 .5.2l2.4-1a7.2 7.2 0 0 0 1.7 1l.4 2.5a.5.5 0 0 0 .5.4h3.8a.5.5 0 0 0 .5-.4l.4-2.5a7.2 7.2 0 0 0 1.7-1l2.4 1a.5.5 0 0 0 .5-.2l1.9-3.3a.5.5 0 0 0-.1-.6l-2-1.5Z"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
{/if}