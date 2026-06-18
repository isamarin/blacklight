export type VideoRendererMode = 'auto' | 'webgpu' | 'video'

export interface VideoFrameStats {
    droppedFrames: number
    queueSize: number
    isProcessing: boolean
    renderingFps: number
    renderDelayMs: number
}

export interface VideoRendererInfo {
    mode: 'webgpu' | 'video'
    adapter?: string
}

export interface VideoRenderer {
    create(stream: MediaStream): Promise<void>
    getElement(): HTMLCanvasElement | HTMLVideoElement | undefined
    toggleDebugOverlay(): void
    destroy(): void
    getRendererInfo(): VideoRendererInfo
    getFrameStats?(): VideoFrameStats | undefined
}