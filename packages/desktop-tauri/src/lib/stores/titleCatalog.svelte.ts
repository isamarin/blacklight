import { trpc } from '$lib/trpc';
import {
	getProducts,
	hydrateCatalog,
	parseNewTitleIds,
	parseRecentTitleIds,
	parseTitlesResponse,
	type TitleEntry
} from '$lib/titles';
import { getIsAuthenticated, getxHomeToken } from '$lib/stores/auth.svelte';

let titles = $state<TitleEntry[]>([]);
let recentIds = $state<string[]>([]);
let newIds = $state<string[]>([]);
let isLoading = $state(false);
let catalogMap = $state(new Map<string, TitleEntry>());
let loadGeneration = 0;

export async function refreshTitleCatalog() {
	if (!getIsAuthenticated()) {
		titles = [];
		recentIds = [];
		newIds = [];
		catalogMap = new Map();
		isLoading = false;
		return;
	}

	const token = getxHomeToken();
	if (!token.token) return;

	const generation = ++loadGeneration;
	isLoading = true;

	try {
		const [allTitles, recent, newTitles] = await Promise.all([
			trpc.gamepass_get_titles.query(token),
			trpc.gamepass_get_recent_titles.query(token),
			trpc.gamepass_get_new_titles.query(token)
		]);

		if (generation !== loadGeneration) return;

		const baseEntries = parseTitlesResponse(allTitles);
		const productIds = baseEntries.map((e) => e.productId).slice(0, 100);

		let hydrated = baseEntries;
		if (productIds.length > 0) {
			const catalogDetails = await trpc.gamepass_batch_productids.query({ token, productIds });
			if (generation !== loadGeneration) return;
			const products = getProducts(catalogDetails);
			if (products) hydrated = hydrateCatalog(baseEntries, products);
		}

		const map = new Map(hydrated.map((t) => [t.titleId, t]));
		titles = hydrated;
		recentIds = parseRecentTitleIds(recent);
		newIds = parseNewTitleIds(newTitles, map);
		catalogMap = map;
	} catch (e) {
		console.error('Failed to load title catalog', e);
	} finally {
		if (generation === loadGeneration) {
			isLoading = false;
		}
	}
}

export function getTitles() {
	return titles;
}

export function getRecentIds() {
	return recentIds;
}

export function getNewIds() {
	return newIds;
}

export function getCatalogIsLoading() {
	return isLoading;
}

export function getTitle(titleId: string) {
	return catalogMap.get(titleId);
}

export function filterTitles(name: string) {
	const q = name.toLowerCase().trim();
	if (!q) return titles.map((t) => t.titleId);
	return titles
		.filter((t) =>
			(t.catalogDetails?.ProductTitle as string | undefined)?.toLowerCase().includes(q)
		)
		.map((t) => t.titleId);
}