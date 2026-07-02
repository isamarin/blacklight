import { Msal } from 'xal-node'
import type { IUserToken } from 'xal-node/dist/lib/tokens/usertoken.js'
import ProxyStore from './proxystore.js'

export function normalizeForceRegionIp(forceRegionIp?: string): string | undefined {
	const ip = forceRegionIp?.trim()
	return ip || undefined
}

export function configureMsalHeaders(msal: Msal, forceRegionIp?: string) {
	const ip = normalizeForceRegionIp(forceRegionIp)
	if (ip) {
		msal.setDefaultHeaders({ 'X-Forwarded-For': ip })
	} else {
		msal.setDefaultHeaders({})
	}
}

export function createMsal(token?: IUserToken, forceRegionIp?: string): Msal {
	const tokenStore = new ProxyStore(token)
	const msal = new Msal(tokenStore)
	configureMsalHeaders(msal, forceRegionIp)
	return msal
}