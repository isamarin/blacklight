import AppLayout from '../components/layout/AppLayout'
import Card from '../components/ui/Card'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { authState } = useAuth()
  const profile = authState?.webToken?.data.DisplayClaims?.xui?.[0] as any

  return (
    <AppLayout title="Profile">
      <Card>
        <h1 className="text-xl font-bold text-white">{profile?.gtg || 'Profile'}</h1>
        <p className="text-white/50 text-sm mt-2">XUID: {profile?.xid || '—'}</p>
        <p className="text-white/40 text-sm mt-4">
          Full profile and achievements view is planned for a future release.
        </p>
      </Card>
    </AppLayout>
  )
}