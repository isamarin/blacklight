<script lang="ts">
	let {
		label,
		onclick,
		class: className = '',
		type = 'button',
		disabled = false,
		variant = 'primary',
		size = 'md'
	}: {
		label: string;
		onclick?: () => void;
		class?: string;
		type?: 'button' | 'submit';
		disabled?: boolean;
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md';
	} = $props();

	const variantClass = $derived(
		variant === 'secondary'
			? 'glass-btn-secondary'
			: variant === 'ghost'
				? 'glass-btn-ghost'
				: variant === 'danger'
					? 'glass-btn-danger'
					: 'glass-btn-primary'
	);

	const sizeClass = $derived(size === 'sm' ? 'glass-btn-sm' : 'glass-btn-md');
</script>

<button
	{type}
	{disabled}
	{onclick}
	class="glass-btn {variantClass} {sizeClass} {className}"
>
	<span class="glass-btn-shine" aria-hidden="true"></span>
	<span class="relative z-10">{label}</span>
</button>