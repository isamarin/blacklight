import { useMutation } from '@tanstack/react-query'
import type { xCloudStreamConfig, xStreamToken } from '@blacklight/player/client'
import { useTRPC } from '../utils/trpc'
import { useAuth } from '../contexts/AuthContext'

export function useStreamMutations() {
  const trpc = useTRPC()
  return {
    startStream: useMutation(trpc.streaming_start_stream.mutationOptions()),
    getStatus: useMutation(trpc.streaming_get_status.mutationOptions()),
    sendSdp: useMutation(trpc.streaming_send_sdp_offer.mutationOptions()),
    sendIce: useMutation(trpc.streaming_send_ice_candidates.mutationOptions()),
    sendMsal: useMutation(trpc.streaming_send_msal_token.mutationOptions()),
    sendKeepalive: useMutation(trpc.streaming_send_keepalive.mutationOptions()),
  }
}

export function createCommunicationHandler(
  token: xStreamToken,
  streamConfig: xCloudStreamConfig,
  session: { sessionId: string; sessionPath: string; state: string },
  mutations: ReturnType<typeof useStreamMutations>,
  getUserRefreshToken: () => string | undefined,
) {
  return {
    getSessionId: () => session.sessionId,
    getSessionPath: () => session.sessionPath,
    getStreamConfig: () => streamConfig,
    async getStreamStatus() {
      return mutations.getStatus.mutateAsync({
        token,
        xCloudStreamConfig: streamConfig,
        sessionPath: session.sessionPath,
      })
    },
    async sendSDPOffer(sdpOffer: RTCSessionDescriptionInit) {
      return mutations.sendSdp.mutateAsync({
        token,
        xCloudStreamConfig: streamConfig,
        sessionPath: session.sessionPath,
        sdpOffer,
      })
    },
    async sendICECandidates(candidates: Array<any>) {
      return mutations.sendIce.mutateAsync({
        token,
        xCloudStreamConfig: streamConfig,
        sessionPath: session.sessionPath,
        candidates,
      })
    },
    async sendMSALToken() {
      const refreshToken = getUserRefreshToken()
      if (!refreshToken) throw new Error('MSAL token is null')
      return mutations.sendMsal.mutateAsync({
        token,
        xCloudStreamConfig: streamConfig,
        sessionPath: session.sessionPath,
        refreshToken,
      })
    },
    async sendKeepalive() {
      return mutations.sendKeepalive.mutateAsync({
        token,
        xCloudStreamConfig: streamConfig,
        sessionPath: session.sessionPath,
      })
    },
  }
}

export function useAuthTokens() {
  const { getWebToken, getxHomeToken, getxCloudToken, getUserRefreshToken } = useAuth()
  return { getWebToken, getxHomeToken, getxCloudToken, getUserRefreshToken }
}