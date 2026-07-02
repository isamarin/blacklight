import { expect } from 'chai'
import { ping } from '../src/server/index.ts'

describe('player server', () => {
	it('ping returns pong', function () {
		expect(ping()).to.equal('pong')
	})
})