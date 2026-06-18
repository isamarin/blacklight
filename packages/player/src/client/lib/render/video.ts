import xCloudPlayer from '../player'
import Overlay from './overlay'
import type { VideoRenderer, VideoRendererInfo } from './types'

export default class VideoComponent implements VideoRenderer {
    private _player:xCloudPlayer

    private _element:HTMLVideoElement | undefined
    private _overlay:Overlay

    constructor(player:any){
        this._player = player
        this._overlay = new Overlay(this, this._player)
    }

    async create(stream: MediaStream): Promise<void> {
        const videoElement = document.createElement('video')
        videoElement.srcObject = stream
        videoElement.autoplay = true
        videoElement.muted = true
        videoElement.playsInline = true
        videoElement.style.width = '100%'
        videoElement.style.height = '100%'
        videoElement.style.objectFit = 'contain'
        videoElement.style.backgroundColor = 'black'
        videoElement.style.touchAction = 'none'

        const element = document.getElementById(this._player.getElementId())
        if (element === null) {
            throw new Error('Player container element not found')
        }

        this._element = videoElement
        element.appendChild(this._element)
        const isStatic = getComputedStyle(element).position === 'static'
        if (isStatic) {
            element.style.position = 'relative'
        }

        this._element.requestVideoFrameCallback(this.processVideoMetadata.bind(this))
    }

    processVideoMetadata(timestamp, data:VideoFrameCallbackMetadata) {
        if(this._element === undefined) {return}

        this._element.requestVideoFrameCallback(this.processVideoMetadata.bind(this))

        this._player._channels.input.queueMetadataFrame({
            serverDataKey: data.rtpTimestamp as number,
            firstFramePacketArrivalTimeMs: data.receiveTime as number,
            frameSubmittedTimeMs: data.receiveTime as number,
            frameDecodedTimeMs: data.expectedDisplayTime,
            frameRenderedTimeMs: data.expectedDisplayTime,
        })
    }

    getElement(){
        return this._element
    }

    toggleDebugOverlay(){
        this._overlay.toggleDebug()
    }

    getRendererInfo(): VideoRendererInfo {
        return { mode: 'video' }
    }

    destroy(){
        const streamHolder = document.getElementById(this._player.getElementId())
        const element = streamHolder?.querySelector('video')

        if(this._overlay !== undefined){
            this._overlay.destroy()
        }

        if(element){
            element.remove()
        }
    }
}