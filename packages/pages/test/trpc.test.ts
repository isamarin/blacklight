import { describe, expect, it } from 'vitest';
import { appRouter, createCallerFactory } from '@blacklight/platform';

describe('pages tRPC router', () => {
	const caller = createCallerFactory(appRouter)({});

	it('ping returns pong', async () => {
		await expect(caller.ping()).resolves.toBe('pong');
	});
});