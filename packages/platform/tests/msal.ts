import { expect } from 'chai'
import { normalizeForceRegionIp } from '../src/utils/msal.js'

describe('msal utils', () => {
	it('normalizeForceRegionIp trims and drops empty values', () => {
		expect(normalizeForceRegionIp(' 1.2.3.4 ')).to.equal('1.2.3.4')
		expect(normalizeForceRegionIp('')).to.equal(undefined)
		expect(normalizeForceRegionIp('   ')).to.equal(undefined)
		expect(normalizeForceRegionIp(undefined)).to.equal(undefined)
	})
})