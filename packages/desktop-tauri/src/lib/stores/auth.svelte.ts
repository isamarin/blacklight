import { isTauriApp } from '$lib/runtime';
import {
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

const normalizeUserToken = (
	token: UserTokenPayload | RouterOutputs['auth_msal_refresh']
): UserTokenPayload => {
	if ('data' in token) {
		const { data } = token;
		return {
			token_type: data.token_type,
			scope: data.scope,
			expires_in: data.expires_in,
			ext_expires_in: data.ext_expires_in ?? data.expires_in,
			access_token: data.access_token,
			refresh_token: data.refresh_token,
			id_token: data.id_token ?? ''
		};
	}
	return token;
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
	const [webToken, streamingTokens] = await Promise.all([
		trpc.auth_get_webtoken.query(userToken),
		trpc.auth_get_streamingtokens.query(userToken)
	]);

	authState = { userToken, webToken, streamingTokens };
	isAuthenticated = true;
};

export async function initAuth() {
	if (initStarted) return;
	initStarted = true;

	isAuthenticating = true;
	const savedUserToken = await loadStoredUserTokenRaw();

	if (savedUserToken) {
		try {
			const userToken = normalizeUserToken(
				JSON.parse(savedUserToken) as UserTokenPayload | RouterOutputs['auth_msal_refresh']
			);

			try {
				await fetchTokensForUser(userToken);
			} catch (error) {
				console.error('Failed to fetch tokens, attempting refresh:', error);
				try {
					const refreshedToken = normalizeUserToken(
						await trpc.auth_msal_refresh.query(userToken)
					);
					await fetchTokensForUser(refreshedToken);
				} catch (refreshError) {
					console.error('Failed to refresh tokens:', refreshError);
					clearAuth();
				}
			}
		} catch (e) {
			console.error('Failed to parse saved user token', e);
			clearAuth();
		}
	}

	hasLoadedFromStorage = true;
	isAuthenticating = false;
}

$effect(() => {
	if (!hasLoadedFromStorage) return;
	void persistUserToken(authState.userToken);
});

export async function startAuth() {
	return trpc.auth_msal_start.query();
}

export async function verifyCode(code: string) {
	try {
		const userToken = await trpc.auth_msal_verify.query(code);
		await fetchTokensForUser(userToken);
		return userToken;
	} finally {
		isAuthenticating = false;
	}
}

export function logout() {
	clearAuth();
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

export function getWebToken() {
	return {
		uhs: (authState.webToken?.data.DisplayClaims?.xui[0] as { uhs?: string } | undefined)?.uhs || '',
		token: authState.webToken?.data.Token || ''
	};
}

export function getxHomeToken() {
	return {
		market: authState.streamingTokens?.xHomeToken?.data.market || '',
		language: getBrowserLanguage() || 'en-us',
		token: authState.streamingTokens?.xHomeToken?.data.gsToken || ''
	};
}

export function getxCloudToken() {
	return {
		market: authState.streamingTokens?.xCloudToken?.data.market || '',
		language: getBrowserLanguage() || 'en-us',
		token: authState.streamingTokens?.xCloudToken?.data.gsToken || ''
	};
}

export function getUserRefreshToken() {
	return authState.userToken?.refresh_token;
}