import type { xCloudStreamConfig, xStreamToken } from '@blacklight/player/client';
import { trpc } from '$lib/trpc';

export function createCommunicationHandler(
	token: xStreamToken,
	streamConfig: xCloudStreamConfig,
	session: { sessionId: string; sessionPath: string; state: string },
	getUserRefreshToken: () => string | undefined
) {
	return {
		getSessionId: () => session.sessionId,
		getSessionPath: () => session.sessionPath,
		getStreamConfig: () => streamConfig,
		async getStreamStatus() {
			return trpc.streaming_get_status.mutate({
				token,
				xCloudStreamConfig: streamConfig,
				sessionPath: session.sessionPath
			});
		},
		async getWaitingTimes(targetId: string) {
			const result = await trpc.streaming_get_waiting_times.mutate({
				token,
				xCloudStreamConfig: streamConfig,
				targetId
			});
			return result as { estimatedTotalWaitTimeInSeconds?: number };
		},
		async sendSDPOffer(sdpOffer: RTCSessionDescriptionInit) {
			return trpc.streaming_send_sdp_offer.mutate({
				token,
				xCloudStreamConfig: streamConfig,
				sessionPath: session.sessionPath,
				sdpOffer
			});
		},
		async sendICECandidates(candidates: Array<unknown>) {
			return trpc.streaming_send_ice_candidates.mutate({
				token,
				xCloudStreamConfig: streamConfig,
				sessionPath: session.sessionPath,
				candidates
			});
		},
		async sendMSALToken() {
			const refreshToken = getUserRefreshToken();
			if (!refreshToken) throw new Error('MSAL token is null');
			return trpc.streaming_send_msal_token.mutate({
				token,
				xCloudStreamConfig: streamConfig,
				sessionPath: session.sessionPath,
				refreshToken
			});
		},
		async sendKeepalive() {
			return trpc.streaming_send_keepalive.mutate({
				token,
				xCloudStreamConfig: streamConfig,
				sessionPath: session.sessionPath
			});
		}
	};
}