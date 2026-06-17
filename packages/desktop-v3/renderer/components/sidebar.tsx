import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

const nav = [
  { href: '/home/', labelKey: 'page.xCloud.breadcrumb', fallback: 'xCloud' },
  { href: '/consoles/', labelKey: 'page.myConsoles.pageTitle', fallback: 'My Consoles' },
  { href: '/xcloud/library/', labelKey: 'page.xCloudLibrary.breadcrumb2', fallback: 'Library' },
  { href: '/settings/home/', labelKey: 'page.settings.sidebar.about', fallback: 'Settings' },
]

export default function Sidebar() {
  const router = useRouter()
  const { t } = useTranslation()
  const { authState, logout } = useAuth()
  const gamertag = (authState?.webToken?.data.DisplayClaims?.xui?.[0] as any)?.gtg || 'Gamertag'

  function handleLogout() {
    if (confirm('Are you sure you want to logout?')) logout()
  }

  return (
    <aside className="w-64 h-full flex flex-col bg-[#0d0d0d] border-r border-white/5 relative z-20">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-1">Blacklight</h2>
        <p className="text-white/40 text-sm">{gamertag}</p>
        <button onClick={handleLogout} className="text-white/50 text-sm hover:text-white mt-1">
          Logout
        </button>
      </div>
      <ul className="px-4 space-y-1">
        {nav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm ${
                router.pathname === item.href || router.pathname.startsWith(item.href.slice(0, -1))
                  ? 'bg-[#107C10]/20 text-[#107C10]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {t(item.labelKey, { defaultValue: item.fallback })}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}