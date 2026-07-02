import { expect } from 'chai'
import { normalizeForceRegionIp, normalizeUserTokenForMsal } from '../src/utils/msal.js'

describe('msal utils', () => {
	it('normalizeForceRegionIp trims and drops empty values', () => {
		expect(normalizeForceRegionIp(' 1.2.3.4 ')).to.equal('1.2.3.4')
		expect(normalizeForceRegionIp('')).to.equal(undefined)
		expect(normalizeForceRegionIp('   ')).to.equal(undefined)
		expect(normalizeForceRegionIp(undefined)).to.equal(undefined)
	})

	it('normalizeUserTokenForMsal derives expires_on from expires_in', () => {
		const now = Date.now()
		const normalized = normalizeUserTokenForMsal({
			token_type: 'Bearer',
			scope: 'xboxlive.signin',
			expires_in: 3600,
			access_token: 'access',
			refresh_token: 'refresh'
		})

		expect(normalized.expires_on).to.be.a('string')
		const expiresAt = Date.parse(normalized.expires_on!)
		expect(expiresAt).to.be.greaterThan(now + 3500_000)
		expect(expiresAt).to.be.lessThan(now + 3700_000)
	})
})