import type xCloudPlayer from '../player'
import type { VideoRenderer, VideoRendererMode } from './types'
import VideoComponent from './video'
import WebGpuComponent from './webgpu'

const WEBGPU_INIT_TIMEOUT_MS = 3000

async function createWebGpuRenderer(player: xCloudPlayer, stream: MediaStream): Promise<VideoRenderer> {
    const renderer = new WebGpuComponent(player)
    await renderer.create(stream)
    return renderer
}

async function createVideoElementRenderer(player: xCloudPlayer, stream: MediaStream): Promise<VideoRenderer> {
    const renderer = new VideoComponent(player)
    await renderer.create(stream)
    return renderer
}

export async function attachVideoRenderer(
    player: xCloudPlayer,
    stream: MediaStream,
    mode: VideoRendererMode,
): Promise<VideoRenderer> {
    if (mode === 'video') {
        return createVideoElementRenderer(player, stream)
    }

    if (mode === 'webgpu') {
        return createWebGpuRenderer(player, stream)
    }

    try {
        return await Promise.race([
            createWebGpuRenderer(player, stream),
            new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('WebGPU init timeout')), WEBGPU_INIT_TIMEOUT_MS)
            }),
        ])
    } catch (error) {
        console.warn('[VideoRenderer] WebGPU unavailable, falling back to <video>:', error)
        return createVideoElementRenderer(player, stream)
    }
}