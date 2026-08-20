import { getCatalogToken } from '$lib/stores/auth.svelte';
import { getTitle } from '$lib/stores/titleCatalog.svelte';
import { getProducts } from '$lib/titles';
import { trpc } from '$lib/trpc';

/**
 * Catalog details for one title.
 *
 * `refreshTitleCatalog` only fills `catalogDetails` for titles covered by the
 * batch it hydrates from, so anything outside it — the "continue playing" title
 * in particular — has to resolve its own product before it has a real name or
 * artwork. Reading `catalogDetails` alone leaves the raw id on screen
 * (e.g. `FORZAHORIZON6` instead of `Forza Horizon 6`).
 */
export function createTitleDetails(titleId: () => string) {
	let product = $state<Record<string, unknown> | undefined>(undefined);
	let loading = $state(false);

	$effect(() => {
		const id = titleId();
		const cached = getTitle(id);

		if (cached?.catalogDetails) {
			product = cached.catalogDetails;
			return;
		}

		let cancelled = false;
		loading = true;

		trpc.gamepass_resolve_productid
			.query({ token: getCatalogToken(), productId: cached?.productId || id })
			.then((resolved) => {
				if (cancelled) return;
				const products = getProducts(resolved);
				product = products ? (Object.values(products)[0] as Record<string, unknown>) : undefined;
			})
			.finally(() => {
				if (!cancelled) loading = false;
			});

		return () => {
			cancelled = true;
		};
	});

	return {
		get product() {
			return product;
		},
		get loading() {
			return loading;
		},
		/** Falls back to the raw id only once resolution has actually failed. */
		get name() {
			return (product?.ProductTitle as string) || titleId();
		}
	};
}
