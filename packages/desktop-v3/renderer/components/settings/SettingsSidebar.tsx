import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'

const links = [
  { href: '/settings/home/', key: 'about' },
  { href: '/settings/streaming/', key: 'streaming' },
  { href: '/settings/input/', key: 'input' },
  { href: '/settings/video/', key: 'video' },
  { href: '/settings/webui/', key: 'webUI' },
  { href: '/settings/debug/', key: 'debug' },
]

export default function SettingsSidebar() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <nav className="w-48 shrink-0 space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`block px-3 py-2 rounded-lg text-sm ${
            router.pathname.startsWith(link.href.replace(/\/$/, ''))
              ? 'bg-[#107C10]/20 text-[#107C10]'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          {t(`page.settings.sidebar.${link.key}`, { defaultValue: link.key })}
        </Link>
      ))}
    </nav>
  )
}