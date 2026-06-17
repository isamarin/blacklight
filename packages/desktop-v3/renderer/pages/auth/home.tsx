import { useEffect, useState } from 'react'
import Head from 'next/head'
import QRCode from 'react-qr-code'
import { RouterOutputs } from '../../utils/trpc'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthHome() {
  const { startAuth, verifyCode } = useAuth()
  const [authFlow, setAuthFlow] = useState<RouterOutputs['auth_msal_start'] | undefined>()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    startAuth()
      .then(async (flow) => {
        if (cancelled || !flow) return
        setAuthFlow(flow)
        await verifyCode(flow.device_code)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || 'Authentication failed')
      })

    return () => {
      cancelled = true
    }
  }, [startAuth, verifyCode])

  return (
    <>
      <Head>
        <title>Greenlight Authentication</title>
      </Head>
      <div className="flex h-screen bg-[#0d0d0d] bg-pattern overflow-hidden">
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-lg w-full glass rounded-2xl p-8 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-2">Sign in with Xbox</h2>
            <p className="text-white/40 text-sm mb-6">Login with your Xbox account to continue</p>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <p className="text-white/80 mb-4">{authFlow?.message || 'Retrieving login details...'}</p>
            {authFlow?.verification_uri && authFlow?.user_code && (
              <div className="flex flex-col items-center gap-4">
                <p className="text-white/50 text-sm text-center">
                  Or scan the QR code with your phone
                </p>
                <QRCode
                  value={`${authFlow.verification_uri}?otc=${authFlow.user_code}`}
                  size={120}
                  bgColor="#0d0d0d"
                  fgColor="#ffffff"
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}