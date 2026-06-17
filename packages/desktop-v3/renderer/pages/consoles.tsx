import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import Label from '../components/ui/Label'
import Button from '../components/ui/Button'
import Loader from '../components/ui/Loader'
import { useTRPC } from '../utils/trpc'
import { useAuth } from '../contexts/AuthContext'

export default function ConsolesPage() {
  const { t } = useTranslation()
  const trpc = useTRPC()
  const { getWebToken } = useAuth()

  const consoles = useQuery({
    ...trpc.smartglass_consoles_list.queryOptions(getWebToken()),
    staleTime: 60 * 1000,
  })

  const list = consoles.data?.data?.result || []

  return (
    <AppLayout title={t('page.myConsoles.pageTitle')}>
      <h1 className="text-2xl font-bold text-white mb-6">{t('page.myConsoles.pageTitle')}</h1>
      <div className="flex flex-wrap gap-4">
        {consoles.isLoading ? (
          <Loader />
        ) : list.length === 0 ? (
          <Card>{t('page.myConsoles.noConsoles')}</Card>
        ) : (
          list.map((item: any) => (
            <Card key={item.id} className="w-72">
              <h2 className="text-lg font-semibold text-white mb-2">{item.name}</h2>
              <p className="text-xs text-white/40 mb-3">{item.id}</p>
              {item.remoteManagementEnabled && item.consoleStreamingEnabled ? (
                item.powerState === 'On' ? (
                  <Label variant="green">{t('page.myConsoles.poweredOn')}</Label>
                ) : (
                  <Label>{item.powerState}</Label>
                )
              ) : (
                <Label variant="orange">{t('page.myConsoles.warningLabel')}</Label>
              )}
              <div className="mt-4">
                <Link href={`/stream/${item.id}/`}>
                  <Button label={t('page.myConsoles.startStreamBtn')} />
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppLayout>
  )
}