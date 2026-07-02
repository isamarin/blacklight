import { trpc, type RouterOutputs } from '$lib/trpc';

type UserTokenPayload = RouterOutputs['auth_msal_verify'];

type AuthState = {
	userToken: UserTokenPayload | null;
	webToken: RouterOutputs['auth_get_webtoken'] | null;
	streamingTokens: RouterOutputs['auth_get_streamingtokens'] | null;
};

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

const clearAuth = () => {
	authState = { userToken: null, webToken: null, streamingTokens: null };
	isAuthenticated = false;
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem('userToken');
	}
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
	const savedUserToken =
		typeof localStorage !== 'undefined' ? localStorage.getItem('userToken') : null;

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
					localStorage.setItem('userToken', JSON.stringify(refreshedToken));
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
	if (!hasLoadedFromStorage || typeof localStorage === 'undefined') return;
	if (authState.userToken) {
		localStorage.setItem('userToken', JSON.stringify(authState.userToken));
	}
});

export async function startAuth() {
	return trpc.auth_msal_start.query();
}

export async function verifyCode(code: string) {
	try {
		const userToken = await trpc.auth_msal_verify.query(code);
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('userToken', JSON.stringify(userToken));
		}
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