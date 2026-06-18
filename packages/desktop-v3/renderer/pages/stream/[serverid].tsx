import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import {
  StreamPlayer,
  type StreamPlayerHandle,
  type xCloudStreamConfig,
} from '@blacklight/player/client'
import StreamOverlay from '../../components/stream/StreamOverlay'
import Loader from '../../components/ui/Loader'
import { useSettings } from '../../contexts/SettingsContext'
import { buildStreamConfig, parseStreamRoute } from '../../lib/stream'
import {
  createCommunicationHandler,
  useAuthTokens,
  useStreamMutations,
} from '../../hooks/useStreamCommunication'

export default function StreamPage() {
  const router = useRouter()
  const serverid = router.query.serverid as string
  const { settings } = useSettings()
  const { getxHomeToken, getxCloudToken, getUserRefreshToken } = useAuthTokens()
  const mutations = useStreamMutations()
  const streamPlayerRef = useRef<StreamPlayerHandle>(null)

  const [streamConfig, setStreamConfig] = useState<xCloudStreamConfig | undefined>()
  const [session, setSession] = useState<{ sessionId: string; sessionPath: string; state: string }>()
  const [status, setStatus] = useState('Starting...')
  const [error, setError] = useState<string | null>(null)

  const parsed = useMemo(
    () => (serverid ? parseStreamRoute(serverid) : null),
    [serverid],
  )

  useEffect(() => {
    if (!parsed) return

    const config = buildStreamConfig(
      parsed.id,
      parsed.type,
      settings.preferred_game_language,
      settings.app_lowresolution ? 720 : 1080,
    )
    const token = parsed.type === 'cloud' ? getxCloudToken() : getxHomeToken()

    mutations.startStream
      .mutateAsync({ token, xCloudStreamConfig: config })
      .then((result) => {
        if (!('sessionId' in result) || !('sessionPath' in result)) {
          throw new Error('Invalid stream session response')
        }
        setStreamConfig(config)
        setSession({
          sessionId: result.sessionId,
          sessionPath: result.sessionPath,
          state: result.state ?? 'Provisioning',
        })
        setStatus('Connecting...')
      })
      .catch((e) => setError(e?.message || 'Failed to start stream'))
  }, [parsed?.id, parsed?.type])

  const communicationHandler = useMemo(() => {
    if (!streamConfig || !session) return null
    const token = streamConfig.type === 'cloud' ? getxCloudToken() : getxHomeToken()
    return createCommunicationHandler(
      token,
      streamConfig,
      session,
      mutations,
      getUserRefreshToken,
    )
  }, [streamConfig, session])

  if (error) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-red-400">
        {error}
        <button className="ml-4 text-white underline" onClick={() => router.back()}>
          Go back
        </button>
      </div>
    )
  }

  if (!communicationHandler) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader />
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <StreamPlayer
        ref={streamPlayerRef}
        onStatusChanged={setStatus}
        communicationHandler={communicationHandler}
        videoRenderer={settings.video_renderer}
      />
      <StreamOverlay
        status={status}
        onToggleDebug={() => streamPlayerRef.current?.toggleDebugOverlay()}
        onAttachGamepad={() => streamPlayerRef.current?.attachGamepad(0)}
        onAttachMkb={() => streamPlayerRef.current?.attachMouseKeyboard(0)}
      />
    </div>
  )
}