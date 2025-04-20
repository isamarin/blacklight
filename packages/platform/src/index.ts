import { appRouter as trpcAppRouter } from './trpc'

export default class GreenlightPlatform {
    appRouter:typeof trpcAppRouter = trpcAppRouter
}

export const appRouter = trpcAppRouter