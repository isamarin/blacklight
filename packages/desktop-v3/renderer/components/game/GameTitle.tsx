import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '../../utils/trpc'
import { useAuth } from '../../contexts/AuthContext'
import { useTitleCatalog } from '../../contexts/TitleCatalogContext'
import Loader from '../ui/Loader'
import { getProducts } from '../../lib/titles'

export default function GameTitle({ titleId }: { titleId: string }) {
  const trpc = useTRPC()
  const { getxHomeToken } = useAuth()
  const { getTitle } = useTitleCatalog()
  const cached = getTitle(titleId)

  const resolved = useQuery({
    ...trpc.gamepass_resolve_productid.queryOptions({
      token: getxHomeToken(),
      productId: cached?.productId || titleId,
    }),
    enabled: !cached?.catalogDetails,
    staleTime: 10 * 60 * 1000,
  })

  const products = getProducts(resolved.data)
  const product =
    cached?.catalogDetails ||
    (products ? (Object.values(products)[0] as Record<string, any>) : undefined)
  const name = product?.ProductTitle || titleId
  const image = product?.Image_Tile?.URL

  if (!product && (resolved.isLoading || !cached)) return <Loader />

  return (
    <div className="group relative w-[140px] shrink-0">
      <Link
        href={`/xcloud/info/${titleId}/`}
        className="absolute top-1 right-1 z-10 w-6 h-6 rounded bg-black/60 text-white/70 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
        title="Info"
      >
        i
      </Link>
      <Link href={`/stream/xcloud_${titleId}/`} className="block">
        {image ? (
          <img
            src={`https:${image}`}
            alt={name}
            className="w-[140px] h-[140px] rounded object-cover"
          />
        ) : (
          <div className="w-[140px] h-[140px] rounded bg-white/5 flex items-center justify-center text-white/30 text-xs">
            {titleId}
          </div>
        )}
        <p className="mt-2 text-xs text-white/70 line-clamp-2">{name}</p>
      </Link>
    </div>
  )
}