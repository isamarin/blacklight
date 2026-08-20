/**
 * Hand-written types for the `@blacklight/platform` tRPC router.
 *
 * The platform package builds its router as `ReturnType<typeof router>` with no
 * procedure argument, so its emitted `.d.ts` erases every procedure — there is
 * no `AppRouter` type to import, and `createTRPCClient<AppRouter>()` is not
 * available to us. These declarations are transcribed from the router's own zod
 * schemas (`dist/src/trpc.js`), which makes the *inputs* exact.
 *
 * Outputs are a different story: most resolvers are declared `Promise<unknown>`
 * upstream, so anything not typed here stays `unknown` on purpose. That forces
 * the call site to narrow through the parsers that already exist
 * (`parseTitlesResponse`, `getProducts`, …) instead of dotting into a shape
 * nobody checked — which is exactly how the blank-artwork and raw-title-id bugs
 * survived to a release.
 *
 * When the platform package learns to emit real declarations, delete this file
 * and type the client from `AppRouter` instead.
 */
import type {
	startStreamResponse,
	xCloudStreamConfig,
	xStreamToken
} from '@blacklight/player/client';
import type { StreamingTokenData } from '@blacklight/player/streaming';
import type { ConsoleInfo } from '$lib/consoles';
import type { ProfilePlayedGames } from '$lib/profile';

/* ── shared input shapes (from the router's zod schemas) ─────────────────── */

export type WebToken = {
	uhs: string;
	token: string;
};

/**
 * The player package already declares these, and the streaming procedures are
 * fed straight from it — aliasing keeps one definition instead of two that can
 * drift apart.
 */
export type XHomeToken = xStreamToken;
export type XCloudStreamConfig = xCloudStreamConfig;

export type UserToken = {
	token_type: string;
	scope: string;
	expires_in: number;
	ext_expires_in: number;
	access_token: string;
	refresh_token: string;
	id_token: string;
};

/** Every auth procedure takes a user token plus an optional region override. */
export type UserTokenRequest = UserToken & { force_region_ip?: string };

/**
 * `auth_msal_verify` and `auth_msal_refresh` return either a bare token or one
 * wrapped in `data`, which is why `normalizeUserToken` tests `'data' in token`.
 */
export type UserTokenResponse =
	| UserToken
	| {
			data: Omit<UserToken, 'ext_expires_in' | 'id_token'> &
				Partial<Pick<UserToken, 'ext_expires_in' | 'id_token'>>;
	  };

export type AuthStartRequest = { force_region_ip?: string } | undefined;

export type AuthVerifyRequest = string | { code: string; force_region_ip?: string };

type StreamSession = {
	token: XHomeToken;
	xCloudStreamConfig: XCloudStreamConfig;
	sessionPath: string;
};

/* ── output shapes, only where the platform actually declares one ────────── */

/** The controllers return the raw upstream envelope; `data` is unvalidated. */
export type HttpResponse<T = unknown> = {
	status?: number;
	headers?: Record<string, string>;
	data?: T;
};

/** OAuth device-code flow; the auth screen renders the code and the URI. */
export type DeviceCodeFlow = {
	user_code: string;
	device_code: string;
	verification_uri: string;
	expires_in: number;
	interval: number;
	message?: string;
};

/** One entry of `DisplayClaims.xui` — gamertag, gamerscore and the user hash. */
export type XuiClaim = {
	uhs?: string;
	gtg?: string;
	gsu?: string;
	xid?: string;
};

export type WebTokenResponse = {
	data: {
		Token: string;
		DisplayClaims?: { xui: XuiClaim[] };
	};
};

/** Shape accepted by `resolveStreamingTokenData`: bare, or wrapped in `data`. */
export type StreamingTokenEnvelope =
	| (({ data?: StreamingTokenData } & StreamingTokenData) | null)
	| undefined;

export type StreamingTokens = {
	xHomeToken: StreamingTokenEnvelope;
	xCloudToken: StreamingTokenEnvelope;
};

export type CurrentProfile = {
	data: {
		profileUsers?: Array<{
			id: string;
			settings?: Array<{ id?: string; value?: string }>;
		}>;
	};
};

/* ── procedure kinds ─────────────────────────────────────────────────────── */

/**
 * Split by kind so calling `.query()` on a mutation stops compiling. The router
 * declares `streaming_*` and `smartglass_console_power_on` as mutations even
 * though several of them read rather than write.
 */
type Query<TInput, TOutput> = {
	query: (input: TInput) => Promise<TOutput>;
};

type Mutation<TInput, TOutput> = {
	mutate: (input: TInput) => Promise<TOutput>;
};

/* ── the router ──────────────────────────────────────────────────────────── */

export type BlacklightRouter = {
	ping: Query<void, string>;
	version: Query<void, string>;
	echo: Query<string, string>;

	auth_msal_start: Query<AuthStartRequest, DeviceCodeFlow>;
	auth_msal_verify: Query<AuthVerifyRequest, UserTokenResponse>;
	auth_msal_refresh: Query<UserTokenRequest, UserTokenResponse>;
	auth_get_streamingtokens: Query<UserTokenRequest, StreamingTokens>;
	auth_get_webtoken: Query<UserTokenRequest, WebTokenResponse>;

	profile_get_current: Query<WebToken, CurrentProfile>;
	profile_get_friends: Query<WebToken, unknown>;
	profile_get_played_games: Query<
		WebToken & { limit?: number; achievementLimit?: number },
		ProfilePlayedGames
	>;

	smartglass_consoles_list: Query<WebToken, HttpResponse<{ result?: ConsoleInfo[] }>>;
	smartglass_console_power_on: Mutation<WebToken & { consoleId: string }, unknown>;

	gamepass_get_titles: Query<XHomeToken, HttpResponse>;
	gamepass_get_recent_titles: Query<XHomeToken, HttpResponse>;
	gamepass_get_new_titles: Query<XHomeToken, HttpResponse>;
	gamepass_batch_productids: Query<
		{ token: XHomeToken; productIds: string[] },
		HttpResponse
	>;
	gamepass_resolve_productid: Query<
		{ token: XHomeToken; productId: string },
		HttpResponse
	>;

	streaming_start_stream: Mutation<
		{ token: XHomeToken; xCloudStreamConfig: XCloudStreamConfig },
		startStreamResponse
	>;
	/** The player declares StatusResponse but does not re-export it from /client. */
	streaming_get_status: Mutation<StreamSession, unknown>;
	streaming_get_waiting_times: Mutation<
		{ token: XHomeToken; xCloudStreamConfig: XCloudStreamConfig; targetId: string },
		unknown
	>;
	streaming_send_sdp_offer: Mutation<StreamSession & { sdpOffer: unknown }, unknown>;
	streaming_send_chat_sdp_offer: Mutation<StreamSession & { sdpOffer: unknown }, unknown>;
	streaming_send_ice_candidates: Mutation<
		StreamSession & { candidates: unknown[] },
		unknown
	>;
	streaming_send_msal_token: Mutation<StreamSession & { refreshToken: string }, unknown>;
	streaming_send_keepalive: Mutation<StreamSession, unknown>;
};

/**
 * Output type of each procedure, e.g. `RouterOutputs['auth_get_webtoken']`.
 * Replaces the old `Record<string, any>`, so these lookups now resolve to a
 * real type instead of silently widening to `any`.
 */
export type RouterOutputs = {
	[K in keyof BlacklightRouter]: BlacklightRouter[K] extends {
		query: (input: never) => Promise<infer TOutput>;
	}
		? TOutput
		: BlacklightRouter[K] extends { mutate: (input: never) => Promise<infer TOutput> }
			? TOutput
			: never;
};
