export interface TitleEntry {
	titleId: string;
	productId: string;
	catalogDetails?: Record<string, unknown>;
}

export function parseTitlesResponse(data: unknown): TitleEntry[] {
	const body = (data as { data?: unknown })?.data ?? data;
	if (!(body as { results?: unknown })?.results) return [];
	return Object.values((body as { results: Record<string, unknown> }).results)
		.map((item) => {
			const row = item as { titleId?: string; details?: { productId?: string } };
			return {
				titleId: row.titleId ?? '',
				productId: row.details?.productId ?? ''
			};
		})
		.filter((item) => item.titleId && item.productId);
}

export function parseRecentTitleIds(data: unknown): string[] {
	return parseTitlesResponse(data).map((t) => t.titleId);
}

export function parseNewTitleIds(siglsData: unknown, catalog: Map<string, TitleEntry>): string[] {
	if (!siglsData) return [];
	const ids: string[] = [];
	for (const key of Object.keys(siglsData as Record<string, unknown>)) {
		const entry = (siglsData as Record<string, { id?: string }>)[key];
		if (!entry?.id) continue;
		for (const title of catalog.values()) {
			if (title.productId === entry.id) ids.push(title.titleId);
		}
	}
	return ids;
}

export function getProducts(response: unknown): Record<string, unknown> | undefined {
	const body = (response as { data?: { Products?: Record<string, unknown> } })?.data;
	return body?.Products;
}

export function hydrateCatalog(
	entries: TitleEntry[],
	products: Record<string, unknown>
): TitleEntry[] {
	const byProduct = new Map(entries.map((e) => [e.productId, e]));
	const result = [...entries];

	for (const product of Object.values(products)) {
		const p = product as { StoreId?: string; XCloudTitleId?: string };
		const match =
			byProduct.get(p.StoreId ?? '') || entries.find((e) => e.titleId === p.XCloudTitleId);
		if (match) match.catalogDetails = product as Record<string, unknown>;
	}

	return result;
}