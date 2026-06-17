export interface TitleEntry {
  titleId: string
  productId: string
  catalogDetails?: Record<string, any>
}

export function parseTitlesResponse(data: any): TitleEntry[] {
  const body = data?.data ?? data
  if (!body?.results) return []
  return Object.values(body.results)
    .map((item: any) => ({
      titleId: item.titleId,
      productId: item.details?.productId,
    }))
    .filter((item) => item.titleId && item.productId)
}

export function parseRecentTitleIds(data: any): string[] {
  return parseTitlesResponse(data).map((t) => t.titleId)
}

export function parseNewTitleIds(siglsData: any, catalog: Map<string, TitleEntry>): string[] {
  if (!siglsData) return []
  const ids: string[] = []
  for (const key of Object.keys(siglsData)) {
    const entry = siglsData[key]
    if (!entry?.id) continue
    for (const title of catalog.values()) {
      if (title.productId === entry.id) ids.push(title.titleId)
    }
  }
  return ids
}

export function getProducts(response: unknown): Record<string, any> | undefined {
  const body = (response as { data?: { Products?: Record<string, any> } })?.data
  return body?.Products
}

export function hydrateCatalog(
  entries: TitleEntry[],
  products: Record<string, any>,
): TitleEntry[] {
  const byProduct = new Map(entries.map((e) => [e.productId, e]))
  const result = [...entries]

  for (const product of Object.values(products)) {
    const p = product as any
    const match = byProduct.get(p.StoreId) || entries.find((e) => e.titleId === p.XCloudTitleId)
    if (match) match.catalogDetails = p
  }

  return result
}