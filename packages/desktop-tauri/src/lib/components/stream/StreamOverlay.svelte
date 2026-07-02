<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	let {
		status,
		onToggleDebug,
		onAttachGamepad,
		onAttachMkb,
		onExit
	}: {
		status: string;
		onToggleDebug: () => void;
		onAttachGamepad: () => void;
		onAttachMkb: () => void;
		onExit: () => void;
	} = $props();
</script>

<div class="absolute top-4 right-4 z-50 flex flex-col gap-2">
	<div class="glass px-3 py-1 rounded text-xs text-white/70">{status}</div>
	<div class="flex gap-2">
		<Button label="Gamepad" onclick={onAttachGamepad} class="text-xs py-1 px-2" />
		<Button label="Keyboard" onclick={onAttachMkb} class="text-xs py-1 px-2" />
		<Button label="Debug (~)" onclick={onToggleDebug} class="text-xs py-1 px-2" />
		<Button label="Exit" onclick={onExit} class="text-xs py-1 px-2 bg-red-800" />
	</div>
</div>