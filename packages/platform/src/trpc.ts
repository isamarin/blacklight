import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import { version } from '../package.json';

import authController from './controller/auth.js';
import profileController from './controller/profile.js';
import smartglassController from './controller/smartglass.js';
import gamepassController from './controller/gamepass.js';

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

const auth = new authController();
const profile = new profileController();
const smartglass = new smartglassController();
const gamepass = new gamepassController();

const zodWebToken = z.object({
  uhs: z.string(),
  token: z.string(),
})

const zodXhomeToken = z.object({
  token: z.string(),
  market: z.string(),
  region: z.string(),
})

const zodUserToken = z.object({
  token_type: z.string(),
  scope: z.string(),
  expires_in: z.number(),
  ext_expires_in: z.number(),
  access_token: z.string(),
  refresh_token: z.string(),
  id_token: z.string(),
})

interface IDeviceCodeVerify {
    access_token: string
    expires_in: number
    ext_expires_in: number
    id_token: string
    refresh_token: string
    scope: string
    token_type: string
}

export const appRouter = router({
    ping: publicProcedure.query(() => 'pong'),
    version: publicProcedure.query(() => version),
    echo: publicProcedure.input(z.string()).query(({ input }) => `echo: ${input}`),

    auth_msal_start: publicProcedure.query(async () => await auth.startMsalAuth()),
    auth_msal_verify: publicProcedure.input(z.string()).query(async ({ input }) => (await auth.verifyDeviceCode(input)) as IDeviceCodeVerify),
    auth_msal_refresh: publicProcedure.input(zodUserToken).query(async ({ input }) => await auth.refreshUserToken(input)),
    auth_get_streamingtokens: publicProcedure.input(zodUserToken).query(async ({ input }) => await auth.getStreamingTokens(input)),
    auth_get_webtoken: publicProcedure.input(zodUserToken).query(async ({ input }) => await auth.getWebToken(input)),

    profile_get_current: publicProcedure.input(zodWebToken).query(async ({ input }) => await profile.getCurrentProfile(input)),
    smartglass_consoles_list: publicProcedure.input(zodWebToken).query(async ({ input }) => await smartglass.getConsolesList(input)),

    gamepass_get_titles: publicProcedure.input(zodXhomeToken).query(async ({ input }) => await gamepass.getTitles(input)),
    gamepass_get_recent_titles: publicProcedure.input(zodXhomeToken).query(async ({ input }) => await gamepass.getRecentTitles(input)),

    gamepass_batch_productids: publicProcedure.input(z.object({ token: zodXhomeToken, productIds: z.array(z.string()) })).query(async ({ input }) => await gamepass.resolveTitles(input.token, input.productIds)),
    gamepass_resolve_productid: publicProcedure.input(z.object({ token: zodXhomeToken, productId: z.string() })).query(async ({ input }) => await gamepass.resolveTitle(input.token, input.productId)),
});

export default appRouter;
