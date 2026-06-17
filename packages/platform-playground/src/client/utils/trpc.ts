import { createTRPCContext } from "@trpc/tanstack-react-query";
import { type inferRouterOutputs } from "@trpc/server";
import { appRouter } from "@blacklight/platform";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<typeof appRouter>();

export type RouterOutputs = inferRouterOutputs<typeof appRouter>;