<script lang="ts">
	let {
		label,
		onclick,
		class: className = '',
		type = 'button',
		disabled = false
	}: {
		label: string;
		onclick?: () => void;
		class?: string;
		type?: 'button' | 'submit';
		disabled?: boolean;
	} = $props();
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="px-4 py-2 rounded-lg bg-[#107C10] hover:bg-[#0e6b0e] text-white font-medium transition disabled:opacity-40 disabled:cursor-not-allowed {className}"
>
	{label}
</button>