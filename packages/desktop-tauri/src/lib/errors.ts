export type UserErrorCode =
	| 'streaming_tokens'
	| 'web_tokens'
	| 'auth_expired'
	| 'network'
	| 'catalog_timeout'
	| 'catalog_missing_token'
	| 'stream_timeout'
	| 'stream_failed'
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
	if (text.includes('web token') || text.includes('webtoken')) return 'web_tokens';
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
		text.includes('econnrefused') ||
		text.includes('timeout')
	) {
		return 'network';
	}

	return 'unknown';
}

export function errorI18nKey(code: UserErrorCode): string {
	return `errors.codes.${code}`;
}