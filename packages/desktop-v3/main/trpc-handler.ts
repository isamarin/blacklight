import { ipcMain } from 'electron'
import { appRouter, createCallerFactory } from '@greenlight/platform'

const createCaller = createCallerFactory(appRouter)

export function setupTrpcHandler() {
  ipcMain.handle('trpc', async (_event, op: {
    path: string
    type: 'query' | 'mutation'
    input: unknown
  }) => {
    try {
      const caller = createCaller({})

      // Support nested paths (e.g. "nested.procedure") as well as flat ones
      const pathParts = op.path.split('.')
      let fn: unknown = caller
      for (const part of pathParts) {
        fn = (fn as Record<string, unknown>)[part]
      }

      const data = await (fn as (input: unknown) => Promise<unknown>)(op.input)
      return { result: { data } }
    } catch (cause: unknown) {
      const error = cause as Error & { code?: string }
      return {
        error: {
          message: error.message ?? 'Internal server error',
          code: error.code ?? 'INTERNAL_SERVER_ERROR',
        },
      }
    }
  })
}
