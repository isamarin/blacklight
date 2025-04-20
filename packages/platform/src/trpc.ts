import { initTRPC } from '@trpc/server';
import { z } from 'zod';

import authController from './controller/auth.js';

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

const auth = new authController();

export const appRouter = router({
  ping: publicProcedure.query(() => 'pong'),
  echo: publicProcedure.input(z.string()).query(({ input }) => `echo: ${input}`),

  auth_msal_start: publicProcedure.query(async () => await auth.startMsalAuth())
});

export default appRouter;
