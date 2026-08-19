// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '@blacklight/player/client' {
	import type { ComponentType } from 'react';

	export type VideoRendererMode = 'auto' | 'webgpu' | 'video';
	export type xCloudStreamConfig = Record<string, any>;
	export type xStreamToken = Record<string, any>;
	export type StreamPlayerHandle = Record<string, any>;
	export type communicationHandler = Record<string, any>;
	export const StreamPlayer: ComponentType<any>;
}

export {};
