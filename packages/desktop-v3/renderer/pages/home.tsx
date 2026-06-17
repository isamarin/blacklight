import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import AppLayout from '../components/layout/AppLayout'
import TitleRow from '../components/xcloud/TitleRow'
import Button from '../components/ui/Button'
import { useTitleCatalog } from '../contexts/TitleCatalogContext'

export default function HomePage() {
  const { t } = useTranslation()
  const { recentIds, newIds, isLoading } = useTitleCatalog()

  return (
    <AppLayout title={t('page.xCloud.pageTitle')}>
      <h1 className="text-2xl font-bold text-white mb-6">{t('page.xCloud.pageTitle')}</h1>
      {isLoading ? (
        <p className="text-white/40">Loading library...</p>
      ) : (
        <>
          <TitleRow title={t('page.xCloud.recentGames')} titleIds={recentIds} />
          <TitleRow
            title={
              <span className="flex items-center gap-3">
                {t('page.xCloud.recentlyAdded')}
                <Link href="/xcloud/library/">
                  <Button label={t('page.xCloud.viewLibraryBtn')} className="text-xs py-1 px-3" />
                </Link>
              </span>
            }
            titleIds={newIds}
          />
        </>
      )}
    </AppLayout>
  )
}