import { useQuery } from '@tanstack/react-query'
import AppLayout from '../../components/layout/AppLayout'
import SettingsSidebar from '../../components/settings/SettingsSidebar'
import Card from '../../components/ui/Card'
import { useTRPC } from '../../utils/trpc'

export default function SettingsDebugPage() {
  const trpc = useTRPC()
  const ping = useQuery(trpc.ping.queryOptions())
  const version = useQuery(trpc.version.queryOptions())

  return (
    <AppLayout title="Debug">
      <div className="flex gap-8">
        <SettingsSidebar />
        <div className="flex-1 space-y-4">
          <Card>
            <h2 className="text-white font-semibold mb-2">Platform</h2>
            <p className="text-white/60 text-sm">Ping: {ping.data}</p>
            <p className="text-white/60 text-sm">Version: {version.data}</p>
          </Card>
          <Card>
            <h2 className="text-white font-semibold mb-2">Environment</h2>
            <pre className="text-xs text-white/50 overflow-auto">
              {JSON.stringify(
                {
                  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
                  platform: typeof process !== 'undefined' ? process.platform : 'web',
                },
                null,
                2,
              )}
            </pre>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}