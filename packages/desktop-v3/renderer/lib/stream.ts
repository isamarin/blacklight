import type { xCloudStreamConfig } from '@greenlight/player/client'

export function parseStreamRoute(serverid: string): { type: 'home' | 'cloud'; id: string } {
  if (serverid.startsWith('xcloud_')) {
    return { type: 'cloud', id: serverid.slice(7) }
  }
  return { type: 'home', id: serverid }
}

export function buildStreamConfig(
  id: string,
  type: 'home' | 'cloud',
  language: string,
  resolution: 720 | 1080 = 1080,
): xCloudStreamConfig {
  return {
    id,
    type,
    language,
    host:
      type === 'cloud'
        ? 'https://uks.core.gssv-play-prod.xboxlive.com'
        : 'https://uks.core.gssv-play-prodxhome.xboxlive.com',
    resolution,
  }
}