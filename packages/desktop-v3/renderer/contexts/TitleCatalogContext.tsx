import { createContext, useContext, useMemo, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '../utils/trpc'
import { useAuth } from './AuthContext'
import {
  getProducts,
  hydrateCatalog,
  parseNewTitleIds,
  parseRecentTitleIds,
  parseTitlesResponse,
  type TitleEntry,
} from '../lib/titles'

interface TitleCatalogContextType {
  titles: TitleEntry[]
  recentIds: string[]
  newIds: string[]
  getTitle: (titleId: string) => TitleEntry | undefined
  filterTitles: (name: string) => string[]
  isLoading: boolean
}

const TitleCatalogContext = createContext<TitleCatalogContextType | undefined>(undefined)

export function TitleCatalogProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC()
  const { isAuthenticated, getxHomeToken } = useAuth()
  const token = getxHomeToken()

  const allTitles = useQuery({
    ...trpc.gamepass_get_titles.queryOptions(token),
    enabled: isAuthenticated && !!token.token,
    staleTime: 5 * 60 * 1000,
  })

  const recent = useQuery({
    ...trpc.gamepass_get_recent_titles.queryOptions(token),
    enabled: isAuthenticated && !!token.token,
    staleTime: 60 * 1000,
  })

  const newTitles = useQuery({
    ...trpc.gamepass_get_new_titles.queryOptions(token),
    enabled: isAuthenticated && !!token.token,
    staleTime: 60 * 60 * 1000,
  })

  const baseEntries = useMemo(
    () => (allTitles.data ? parseTitlesResponse(allTitles.data) : []),
    [allTitles.data],
  )

  const productIds = useMemo(() => baseEntries.map((e) => e.productId).slice(0, 100), [baseEntries])

  const catalogDetails = useQuery({
    ...trpc.gamepass_batch_productids.queryOptions({ token, productIds }),
    enabled: isAuthenticated && productIds.length > 0,
    staleTime: 10 * 60 * 1000,
  })

  const titles = useMemo(() => {
    const products = getProducts(catalogDetails.data)
    if (!products) return baseEntries
    return hydrateCatalog(baseEntries, products)
  }, [baseEntries, catalogDetails.data])

  const catalogMap = useMemo(() => new Map(titles.map((t) => [t.titleId, t])), [titles])

  const value: TitleCatalogContextType = {
    titles,
    recentIds: recent.data ? parseRecentTitleIds(recent.data) : [],
    newIds: newTitles.data ? parseNewTitleIds(newTitles.data, catalogMap) : [],
    getTitle: (titleId) => catalogMap.get(titleId),
    filterTitles: (name) => {
      const q = name.toLowerCase().trim()
      if (!q) return titles.map((t) => t.titleId)
      return titles
        .filter((t) => t.catalogDetails?.ProductTitle?.toLowerCase().includes(q))
        .map((t) => t.titleId)
    },
    isLoading: allTitles.isLoading || recent.isLoading,
  }

  return <TitleCatalogContext.Provider value={value}>{children}</TitleCatalogContext.Provider>
}

export function useTitleCatalog() {
  const ctx = useContext(TitleCatalogContext)
  if (!ctx) throw new Error('useTitleCatalog must be used within TitleCatalogProvider')
  return ctx
}