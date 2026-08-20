/**
 * Tracks the cursor inside an element as `--mx` / `--my`, which the
 * `.card-glow` layer in `app.css` renders as a soft accent-tinted highlight.
 */
export function cardGlow(node: HTMLElement) {
	function handleMove(event: PointerEvent) {
		const rect = node.getBoundingClientRect();
		node.style.setProperty('--mx', `${event.clientX - rect.left}px`);
		node.style.setProperty('--my', `${event.clientY - rect.top}px`);
	}

	function handleLeave() {
		node.style.removeProperty('--mx');
		node.style.removeProperty('--my');
	}

	node.addEventListener('pointermove', handleMove);
	node.addEventListener('pointerleave', handleLeave);

	return {
		destroy() {
			node.removeEventListener('pointermove', handleMove);
			node.removeEventListener('pointerleave', handleLeave);
		}
	};
}
