import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import authController from './controller/auth.js';
import profileController from './controller/profile.js';

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

const auth = new authController();
const profile = new profileController();

const zodWebToken = z.object({
  uhs: z.string(),
  token: z.string(),
})

export const appRouter = router({
    ping: publicProcedure.query(() => 'pong'),
    echo: publicProcedure.input(z.string()).query(({ input }) => `echo: ${input}`),

    auth_msal_start: publicProcedure.query(async () => await auth.startMsalAuth()),
    auth_msal_verify: publicProcedure.input(z.string()).query(async ({ input }) => await auth.verifyDeviceCode(input)),
    auth_get_streamingtokens: publicProcedure.input(z.string()).query(async ({ input }) => await auth.getStreamingTokens(input)),
    auth_get_webtoken: publicProcedure.input(z.string()).query(async ({ input }) => await auth.getWebToken(input)),

    profile_get_current: publicProcedure.input(z.object({ token: zodWebToken })).query(async ({ input }) => await profile.getCurrentProfile(input.token))

});

export default appRouter;
