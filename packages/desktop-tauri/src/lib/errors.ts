export type UserErrorCode =
	| 'streaming_tokens'
	| 'web_tokens'
	| 'auth_expired'
	| 'network'
	| 'catalog_timeout'
	| 'catalog_missing_token'
	| 'stream_timeout'
	| 'stream_failed'
	| 'consoles_load_failed'
	| 'console_wake_failed'
	| 'mic_failed'
	| 'unknown';

export function extractErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (error && typeof error === 'object' && 'message' in error) {
		return String((error as { message: unknown }).message);
	}
	return String(error);
}

export function classifyError(error: unknown): UserErrorCode {
	const text = extractErrorMessage(error).toLowerCase();

	if (text.includes('streaming token') || text.includes('streamingtoken')) {
		return 'streaming_tokens';
	}
	if (text.includes('xcloud') && text.includes('token')) return 'streaming_tokens';
	if (text.includes('gstoken') || text.includes('xhome token')) return 'streaming_tokens';
	if (text.includes('web token') || text.includes('webtoken') || text.includes('smartglass')) {
		return 'web_tokens';
	}
	if (text.includes('console') && (text.includes('list') || text.includes('load'))) {
		return 'consoles_load_failed';
	}
	if (text.includes('console wake') || text.includes('wake timed out')) {
		return 'console_wake_failed';
	}
	if (text.includes('microphone') || text.includes('getusermedia') || text.includes('mic')) {
		return 'mic_failed';
	}
	if (
		text.includes('expired') ||
		text.includes('invalid_grant') ||
		text.includes('refresh') ||
		text.includes('unauthorized') ||
		text.includes('401')
	) {
		return 'auth_expired';
	}
	if (
		text.includes('network') ||
		text.includes('fetch') ||
		text.includes('load failed') ||
		text.includes('failed to fetch') ||
		text.includes('econnrefused') ||
		text.includes('api failed to start') ||
		text.includes('timeout')
	) {
		return 'network';
	}

	return 'unknown';
}

export function errorI18nKey(code: UserErrorCode): string {
	return `errors.codes.${code}`;
}