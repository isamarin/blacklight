import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import AppLayout from '../../components/layout/AppLayout'
import Breadcrumb from '../../components/ui/Breadcrumb'
import GameTitle from '../../components/game/GameTitle'
import Loader from '../../components/ui/Loader'
import { useTitleCatalog } from '../../contexts/TitleCatalogContext'

export default function XCloudLibraryPage() {
  const { t } = useTranslation()
  const { titles, filterTitles, isLoading } = useTitleCatalog()
  const [filter, setFilter] = useState('')

  const titleIds = filter ? filterTitles(filter) : titles.map((t) => t.titleId)

  return (
    <AppLayout title={t('page.xCloudLibrary.pageTitle')}>
      <Breadcrumb
        items={[
          { href: '/home/', label: t('page.xCloudLibrary.breadcrumb1') },
          { href: '/xcloud/library/', label: t('page.xCloudLibrary.breadcrumb2') },
        ]}
      />
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">{t('page.xCloudLibrary.title')}</h1>
        <input
          type="text"
          placeholder={t('page.xCloudLibrary.searchPlaceholder')}
          className="flex-1 max-w-xs px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-wrap gap-4">
          {titleIds.map((id) => (
            <GameTitle key={id} titleId={id} />
          ))}
        </div>
      )}
    </AppLayout>
  )
}