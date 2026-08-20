import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { StreamPlayerHandle } from '@blacklight/player/client';
import { isTauriApp } from '$lib/runtime';

export type NativeGamepad = {
	index: number;
	id: string;
	name: string;
	buttons: number;
	axes: number;
	rumble: boolean;
	state: Record<string, number>;
};

export async function listNativeGamepads(): Promise<NativeGamepad[]> {
	if (!isTauriApp()) return [];
	try {
		return await invoke<NativeGamepad[]>('list_gamepads');
	} catch {
		return [];
	}
}

export async function subscribeNativeGamepads(
	onChange: (pads: NativeGamepad[]) => void
): Promise<UnlistenFn> {
	onChange(await listNativeGamepads());
	if (!isTauriApp()) return () => {};

	let unlisten: UnlistenFn | undefined;
	try {
		unlisten = await listen<NativeGamepad[]>('gamepads-changed', (event) => {
			onChange(event.payload ?? []);
		});
	} catch {
		unlisten = undefined;
	}
	const poll = window.setInterval(() => {
		void listNativeGamepads().then(onChange);
	}, 1000);

	return () => {
		window.clearInterval(poll);
		unlisten?.();
	};
}

export function startNativeGamepadBridge(handle: StreamPlayerHandle): () => void {
	if (!isTauriApp()) return () => {};

	const virtual = handle.attachGamepad(0);
	let inflight = false;
	const timer = window.setInterval(() => {
		if (inflight) return;
		inflight = true;
		void listNativeGamepads()
			.then((pads) => {
				const pad = pads[0];
				if (!pad) return;
				for (const [button, value] of Object.entries(pad.state)) {
					virtual.sendGamepadButtonState(button, value);
				}
			})
			.finally(() => {
				inflight = false;
			});
	}, 8);

	return () => window.clearInterval(timer);
}
