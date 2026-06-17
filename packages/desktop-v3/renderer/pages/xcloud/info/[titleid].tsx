import { useRouter } from 'next/router'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../../components/layout/AppLayout'
import Breadcrumb from '../../../components/ui/Breadcrumb'
import Button from '../../../components/ui/Button'
import Loader from '../../../components/ui/Loader'
import { useTRPC } from '../../../utils/trpc'
import { useAuth } from '../../../contexts/AuthContext'
import { useTitleCatalog } from '../../../contexts/TitleCatalogContext'
import { getProducts } from '../../../lib/titles'

export default function XCloudInfoPage() {
  const router = useRouter()
  const titleId = router.query.titleid as string
  const { t } = useTranslation()
  const trpc = useTRPC()
  const { getxHomeToken } = useAuth()
  const { getTitle } = useTitleCatalog()
  const cached = getTitle(titleId)

  const resolved = useQuery({
    ...trpc.gamepass_resolve_productid.queryOptions({
      token: getxHomeToken(),
      productId: cached?.productId || titleId,
    }),
    enabled: !!titleId && !cached?.catalogDetails,
  })

  const products = getProducts(resolved.data)
  const product =
    cached?.catalogDetails ||
    (products ? (Object.values(products)[0] as Record<string, any>) : undefined)

  if (!product) {
    return (
      <AppLayout>
        <Loader />
      </AppLayout>
    )
  }

  return (
    <AppLayout title={product.ProductTitle}>
      <Breadcrumb
        items={[
          { href: '/home/', label: t('page.titleInfo.breadcrumb1') },
          { href: '/xcloud/library/', label: t('page.titleInfo.breadcrumb2') },
          { href: `/xcloud/info/${titleId}/`, label: product.ProductTitle },
        ]}
      />
      <div className="flex gap-8">
        <div className="shrink-0">
          {product.Image_Poster?.URL && (
            <img
              src={`https:${product.Image_Poster.URL}`}
              alt={product.ProductTitle}
              className="w-40 rounded-lg"
            />
          )}
          <Link href={`/stream/xcloud_${titleId}/`} className="block mt-4">
            <Button label={t('page.titleInfo.startStreamBtn')} />
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{product.ProductTitle}</h1>
          <p className="text-white/50 mt-1">
            {t('page.titleInfo.by')} {product.PublisherName}
          </p>
          <h3 className="text-lg font-semibold text-white mt-6">{t('page.titleInfo.descriptionTitle')}</h3>
          <p className="text-white/70 mt-2">{product.ProductDescriptionShort}</p>
        </div>
      </div>
    </AppLayout>
  )
}