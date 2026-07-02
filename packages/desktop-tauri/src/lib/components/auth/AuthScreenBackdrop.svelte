<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const MAX_SHIFT = 20;
	const IMAGE_SCALE = 1.08;
	const EASE = 0.09;

	let rootEl = $state<HTMLDivElement | null>(null);
	let imageEl = $state<HTMLImageElement | null>(null);

	let targetX = 0;
	let targetY = 0;
	let currentX = 0;
	let currentY = 0;
	let rafId: number | undefined;
	let motionEnabled = true;

	function applyTransform(x: number, y: number) {
		if (!imageEl) return;
		imageEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${IMAGE_SCALE})`;
	}

	function tick() {
		const dx = targetX - currentX;
		const dy = targetY - currentY;

		if (Math.abs(dx) < 0.04 && Math.abs(dy) < 0.04) {
			currentX = targetX;
			currentY = targetY;
			applyTransform(currentX, currentY);
			rafId = undefined;
			return;
		}

		currentX += dx * EASE;
		currentY += dy * EASE;
		applyTransform(currentX, currentY);
		rafId = requestAnimationFrame(tick);
	}

	function startAnimation() {
		if (rafId !== undefined) return;
		rafId = requestAnimationFrame(tick);
	}

	function setTarget(x: number, y: number) {
		if (!motionEnabled) return;
		targetX = x;
		targetY = y;
		startAnimation();
	}

	function handlePointerMove(event: PointerEvent) {
		if (!rootEl) return;

		const rect = rootEl.getBoundingClientRect();
		const nx = (event.clientX - rect.left) / rect.width - 0.5;
		const ny = (event.clientY - rect.top) / rect.height - 0.5;

		setTarget(nx * MAX_SHIFT, ny * MAX_SHIFT);
	}

	function handlePointerLeave() {
		setTarget(0, 0);
	}

	function disableMotion() {
		motionEnabled = false;
		targetX = 0;
		targetY = 0;
		currentX = 0;
		currentY = 0;
		if (rafId !== undefined) {
			cancelAnimationFrame(rafId);
			rafId = undefined;
		}
		applyTransform(0, 0);
	}

	onMount(() => {
		applyTransform(0, 0);

		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const syncMotion = () => {
			if (media.matches) disableMotion();
			else motionEnabled = true;
		};

		syncMotion();
		media.addEventListener('change', syncMotion);

		return () => {
			media.removeEventListener('change', syncMotion);
			if (rafId !== undefined) cancelAnimationFrame(rafId);
		};
	});
</script>

<div
	class="auth-screen"
	bind:this={rootEl}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
>
	<div class="auth-screen-backdrop" aria-hidden="true">
		<img
			bind:this={imageEl}
			src="/images/hero-background.png"
			alt=""
			class="auth-screen-image"
			loading="eager"
			decoding="async"
		/>
	</div>
	<div class="auth-screen-content">
		{@render children()}
	</div>
</div>