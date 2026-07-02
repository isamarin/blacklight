export type PagesRoute =
	| { type: 'trpc' }
	| { type: 'redirect'; location: string }
	| { type: 'not-found' };

export function matchPagesRoute(pathname: string, origin: string): PagesRoute {
	if (pathname.startsWith('/trpc')) {
		return { type: 'trpc' };
	}

	if (pathname === '/') {
		return { type: 'redirect', location: `${origin}/home` };
	}

	return { type: 'not-found' };
}