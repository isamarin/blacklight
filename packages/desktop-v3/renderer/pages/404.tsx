import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="h-screen bg-[#0d0d0d] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white mb-2">404</h1>
      <p className="text-white/50 mb-6">{t('errors.pageNotFound', { defaultValue: 'Page not found' })}</p>
      <Link href="/home/" className="text-[#107C10] hover:underline">
        {t('errors.returnHome', { defaultValue: 'Return home' })}
      </Link>
    </div>
  )
}