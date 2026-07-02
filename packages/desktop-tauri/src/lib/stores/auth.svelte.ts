import { authForceRegionIp, withAuthRegion } from '$lib/auth/region';
import { classifyError, type UserErrorCode } from '$lib/errors';
import { buildStreamingToken } from '$lib/streaming-token';
import { isTauriApp } from '$lib/runtime';
import {
	clearAppDataFromTauri,
	clearUserTokenFromTauri,
	getUserTokenFromTauri,
	saveUserTokenToTauri
} from '$lib/tauri';
import { trpc, type RouterOutputs } from '$lib/trpc';

type UserTokenPayload = RouterOutputs['auth_msal_verify'];

type AuthState = {
	userToken: UserTokenPayload | null;
	webToken: RouterOutputs['auth_get_webtoken'] | null;
	streamingTokens: RouterOutputs['auth_get_streamingtokens'] | null;
};

const USER_TOKEN_STORAGE_KEY = 'userToken';

let authState = $state<AuthState>({
	userToken: null,
	webToken: null,
	streamingTokens: null
});
let isAuthenticated = $state(false);
let isAuthenticating = $state(false);
let hasLoadedFromStorage = $state(false);
let initStarted = $state(false);
let authError = $state<UserErrorCode | null>(null);

const enrichTokenExpiry = (token: UserTokenPayload): UserTokenPayload => {
	const withExpiry = token as UserTokenPayload & { expires_on?: string };
	if (withExpiry.expires_on?.trim()) {
		return token;
	}

	if (!token.expires_in) {
		return token;
	}

	return {
		...token,
		expires_on: new Date(Date.now() + token.expires_in * 1000).toISOString()
	} as UserTokenPayload & { expires_on: string };
};

const normalizeUserToken = (
	token: UserTokenPayload | RouterOutputs['auth_msal_refresh']
): UserTokenPayload => {
	if ('data' in token) {
		const { data } = token;
		return enrichTokenExpiry({
			token_type: data.token_type,
			scope: data.scope,
			expires_in: data.expires_in,
			ext_expires_in: data.ext_expires_in ?? data.expires_in,
			access_token: data.access_token,
			refresh_token: data.refresh_token,
			id_token: data.id_token ?? ''
		});
	}
	return enrichTokenExpiry(token);
};

function loadLegacyLocalStorageToken(): string | null {
	if (typeof localStorage === 'undefined') return null;
	return localStorage.getItem(USER_TOKEN_STORAGE_KEY);
}

function clearLegacyLocalStorageToken() {
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem(USER_TOKEN_STORAGE_KEY);
	}
}

async function loadStoredUserTokenRaw(): Promise<string | null> {
	if (isTauriApp()) {
		const token = await getUserTokenFromTauri();
		if (token) {
			return JSON.stringify(token);
		}

		const legacy = loadLegacyLocalStorageToken();
		if (legacy) {
			try {
				const parsed = JSON.parse(legacy) as UserTokenPayload;
				await saveUserTokenToTauri(parsed);
				clearLegacyLocalStorageToken();
				return legacy;
			} catch (e) {
				console.error('Failed to migrate legacy user token', e);
				clearLegacyLocalStorageToken();
			}
		}

		return null;
	}

	return loadLegacyLocalStorageToken();
}

async function persistUserToken(token: UserTokenPayload | null): Promise<void> {
	if (isTauriApp()) {
		if (token) {
			await saveUserTokenToTauri(token);
		} else {
			await clearUserTokenFromTauri();
		}
		clearLegacyLocalStorageToken();
		return;
	}

	if (typeof localStorage === 'undefined') return;
	if (token) {
		localStorage.setItem(USER_TOKEN_STORAGE_KEY, JSON.stringify(token));
	} else {
		localStorage.removeItem(USER_TOKEN_STORAGE_KEY);
	}
}

const clearAuth = () => {
	authState = { userToken: null, webToken: null, streamingTokens: null };
	isAuthenticated = false;
	void persistUserToken(null);
};

const fetchTokensForUser = async (userToken: UserTokenPayload) => {
	const request = withAuthRegion(enrichTokenExpiry(userToken));
	// Sequential: parallel XSTS/refresh with a fresh MSAL token can invalidate the refresh token.
	const webToken = await trpc.auth_get_webtoken.query(request);

	let streamingTokens: AuthState['streamingTokens'] = null;
	try {
		streamingTokens = await trpc.auth_get_streamingtokens.query(request);
		authError = null;
	} catch (error) {
		console.error('Failed to fetch streaming tokens:', error);
		authError = classifyError(error);
	}

	authState = { userToken, webToken, streamingTokens };
	isAuthenticated = true;
	if (streamingTokens) {
		authError = null;
	}
	if (hasLoadedFromStorage) {
		void persistUserToken(userToken);
	}
};

async function restoreSessionFromStorage(): Promise<boolean> {
	const savedUserToken = await loadStoredUserTokenRaw();
	if (!savedUserToken) return false;

	try {
		const userToken = normalizeUserToken(
			JSON.parse(savedUserToken) as UserTokenPayload | RouterOutputs['auth_msal_refresh']
		);

		try {
			await fetchTokensForUser(userToken);
			return true;
		} catch (error) {
			console.error('Failed to fetch tokens, attempting refresh:', error);
			try {
				const refreshedToken = normalizeUserToken(
					await trpc.auth_msal_refresh.query(withAuthRegion(userToken))
				);
				await fetchTokensForUser(refreshedToken);
				return true;
			} catch (refreshError) {
				console.error('Failed to refresh tokens:', refreshError);
				authError = classifyError(refreshError);
				clearAuth();
				return false;
			}
		}
	} catch (e) {
		console.error('Failed to parse saved user token', e);
		authError = 'auth_expired';
		clearAuth();
		return false;
	}
}

export async function initAuth() {
	if (initStarted) return;
	initStarted = true;

	isAuthenticating = true;
	await restoreSessionFromStorage();
	hasLoadedFromStorage = true;
	isAuthenticating = false;
}

export async function startAuth() {
	authError = null;
	const forceRegionIp = authForceRegionIp();
	return trpc.auth_msal_start.query(forceRegionIp ? { force_region_ip: forceRegionIp } : undefined);
}

export async function verifyCode(code: string) {
	try {
		const userToken = await trpc.auth_msal_verify.query({
			code,
			force_region_ip: authForceRegionIp()
		});
		await fetchTokensForUser(userToken);
		return userToken;
	} catch (error) {
		authError = classifyError(error);
		throw error;
	} finally {
		isAuthenticating = false;
	}
}

export async function retryStoredAuth(): Promise<boolean> {
	isAuthenticating = true;
	authError = null;
	const restored = await restoreSessionFromStorage();
	isAuthenticating = false;
	return restored;
}

export function logout() {
	authError = null;
	clearAuth();
}

export async function clearAppData() {
	authError = null;
	clearAuth();
	if (typeof localStorage !== 'undefined') {
		localStorage.clear();
	}
	if (isTauriApp()) {
		await clearAppDataFromTauri();
		return;
	}
	window.location.reload();
}

export function clearAuthError() {
	authError = null;
}

const getBrowserLanguage = () => {
	const primaryLang = navigator.languages?.[0]?.split('-')[0] || 'en';
	const regionalVariant =
		navigator.languages
			?.find((lang) => lang.toLowerCase().startsWith(`${primaryLang}-`))
			?.toLowerCase() || `${primaryLang}-us`;
	return regionalVariant;
};

export function getAuthState() {
	return authState;
}

export function getIsAuthenticated() {
	return isAuthenticated;
}

export function getIsAuthenticating() {
	return isAuthenticating;
}

export function getAuthError() {
	return authError;
}

export function getWebToken() {
	return {
		uhs: (authState.webToken?.data.DisplayClaims?.xui[0] as { uhs?: string } | undefined)?.uhs || '',
		token: authState.webToken?.data.Token || ''
	};
}

export function getxHomeToken() {
	const language = getBrowserLanguage() || 'en-us';
	return buildStreamingToken(authState.streamingTokens?.xHomeToken?.data, language);
}

export function getxCloudToken() {
	const language = getBrowserLanguage() || 'en-us';
	return buildStreamingToken(authState.streamingTokens?.xCloudToken?.data, language);
}

export function hasStreamingTokens() {
	return Boolean(authState.streamingTokens?.xHomeToken?.data.gsToken);
}

export function getUserRefreshToken() {
	return authState.userToken?.refresh_token;
}