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

export const appRouter = router({
    ping: publicProcedure.query(() => 'pong'),
    version: publicProcedure.query(() => version),
    echo: publicProcedure.input(z.string()).query(({ input }) => `echo: ${input}`),

    auth_msal_start: publicProcedure.query(async () => await auth.startMsalAuth()),
    auth_msal_verify: publicProcedure.input(z.string()).query(async ({ input }) => await auth.verifyDeviceCode(input)),
    auth_get_streamingtokens: publicProcedure.input(z.string()).query(async ({ input }) => await auth.getStreamingTokens(input)),
    auth_get_webtoken: publicProcedure.input(z.string()).query(async ({ input }) => await auth.getWebToken(input)),

    profile_get_current: publicProcedure.input(z.object({ token: zodWebToken })).query(async ({ input }) => await profile.getCurrentProfile(input.token)),

    smartglass_consoles_list: publicProcedure.input(z.object({ token: zodWebToken })).query(async ({ input }) => await smartglass.getConsolesList(input.token)),

    gamepass_get_titles: publicProcedure.input(z.object({ token: zodXhomeToken })).query(async ({ input }) => await gamepass.getTitles(input.token)),
    gamepass_get_recent_titles: publicProcedure.input(z.object({ token: zodXhomeToken })).query(async ({ input }) => await gamepass.getRecentTitles(input.token)),

    gamepass_batch_productids: publicProcedure.input(z.object({ token: zodXhomeToken, productIds: z.array(z.string()) })).mutation(async ({ input }) => await gamepass.resolveTitles(input.token, input.productIds)),
    gamepass_resolve_productid: publicProcedure.input(z.object({ token: zodXhomeToken, productId: z.string() })).query(async ({ input }) => await gamepass.resolveTitle(input.token, input.productId)),
});

export default appRouter;
