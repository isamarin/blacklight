export type UserErrorCode =
	| 'streaming_tokens'
	| 'web_tokens'
	| 'auth_expired'
	| 'region_mismatch'
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

export function errorText(error: unknown): string {
	const message = extractErrorMessage(error);
	const code =
		error && typeof error === 'object' && 'data' in error
			? String((error as { data?: { code?: unknown } }).data?.code ?? '')
			: '';

	return `${message} ${code}`.toLowerCase();
}

export function classifyError(error: unknown): UserErrorCode {
	const text = errorText(error);

	if (
		text.includes('gssv') ||
		text.includes('gssv-play-prod') ||
		text.includes('gssv-play-prodxhome') ||
		text.includes('catalog.gamepass.com') ||
		text.includes('/v2/titles')
	) {
		if (
			text.includes('401') ||
			text.includes('403') ||
			text.includes('unauthorized') ||
			text.includes('forbidden')
		) {
			return 'region_mismatch';
		}
		if (text.includes('error fetching')) {
			return 'streaming_tokens';
		}
	}

	if (text.includes('streaming token') || text.includes('streamingtoken')) {
		return 'streaming_tokens';
	}
	if (text.includes('xcloud') && text.includes('token')) return 'streaming_tokens';
	if (text.includes('gstoken') || text.includes('xhometoken')) return 'streaming_tokens';
	if (text.includes('no correct token provided')) return 'streaming_tokens';
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
		text.includes('tokenrefresherror') ||
		text.includes('failed to refresh') ||
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
		text.includes('connection refused') ||
		text.includes('api failed to start') ||
		text.includes('unable to connect') ||
		text.includes('trpcclienterror') ||
		text.includes('timeout')
	) {
		return 'network';
	}

	return 'unknown';
}

export function errorI18nKey(code: UserErrorCode): string {
	return `errors.codes.${code}`;
}