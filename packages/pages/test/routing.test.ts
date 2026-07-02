import { describe, expect, it } from 'vitest';
import { matchPagesRoute } from '../src/routing';

describe('matchPagesRoute', () => {
	it('redirects root to /home', () => {
		expect(matchPagesRoute('/', 'http://example.com')).toEqual({
			type: 'redirect',
			location: 'http://example.com/home'
		});
	});

	it('routes tRPC paths to the tRPC handler', () => {
		expect(matchPagesRoute('/trpc/ping', 'http://example.com')).toEqual({
			type: 'trpc'
		});
	});

	it('returns not-found for unknown paths', () => {
		expect(matchPagesRoute('/missing', 'http://example.com')).toEqual({
			type: 'not-found'
		});
	});
});