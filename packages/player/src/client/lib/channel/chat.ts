import Channel from './channel'

export default class ChatChannel extends Channel {

    isCapturing = false
    isPaused = true
    _micPermissions:'granted'|'denied'|'prompt' = 'prompt'
    _micStream:MediaStream | undefined

    constructor(player:any){
        super(player)

        if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
            navigator.permissions.query({ name: 'microphone' as PermissionName }).then((permissionStatus) => {
                this._micPermissions = permissionStatus.state

                permissionStatus.onchange = () => {
                    this._micPermissions = permissionStatus.state
                }
            }).catch(() => {
                // Permission API unavailable (e.g. some WebViews)
            })
        }
    }

    getChannelName() {
        return 'chat'
    }

    getChannelConfig() {
        return {
            ordered: true,
            protocol: 'chatV1',
        }
    }

    startMic() {
        if(this._micPermissions === 'denied'){
            throw new Error('Microphone permissions are denied')
        }

        if(this.isCapturing === true){
            this.isPaused = false
            return
        }

        navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                sampleRate: 24e3,
            },
        }).then((stream) => {
            this.isCapturing = true
            this._micStream = stream
            this.isPaused = false

            stream.getTracks().forEach((track) => {
                this.getPlayer()._peerConnection.addTrack(track, stream)
            })

            this.getPlayer().sdpNegotiationChat()
        }).catch((err) => {
            this.isCapturing = false
            this._micStream = undefined
            this.isPaused = true
            console.error('Microphone error:', err)
        })
    }

    stopMic() {
        if(this._micStream !== undefined) {
            this._micStream.getTracks().forEach((track) => {
                track.stop()
            })
            this._micStream = undefined
        }

        this.getPlayer()._peerConnection.getSenders().forEach((sender) => {
            if(sender.track && sender.track.kind === 'audio'){
                this.getPlayer()._peerConnection.removeTrack(sender)
            }
        })

        this.isCapturing = false
        this.isPaused = true
    }

    destroy() {
        if(this.isCapturing){
            this.stopMic()
        }
    }
}