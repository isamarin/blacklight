import { redirect } from '@sveltejs/kit';
import { isDebugUnlocked } from '$lib/debug-unlock';

/** Debug is a hidden beta panel — unlock via 7 taps on About version. */
export function load() {
	if (!isDebugUnlocked()) {
		redirect(307, '/settings/home');
	}
	return {};
}
