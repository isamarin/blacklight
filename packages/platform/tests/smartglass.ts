import { expect } from 'chai'
import smartglassController from '../src/controller/smartglass.js'

describe('smartglassController', () => {
	const controller = new smartglassController()

	it('getConsolesList rejects missing token', async function () {
		try {
			await controller.getConsolesList({ uhs: '', token: '' })
			expect.fail('expected UNAUTHORIZED')
		} catch (error) {
			expect((error as { code?: string }).code).to.equal('UNAUTHORIZED')
		}
	})

	it('powerOn rejects missing token', async function () {
		try {
			await controller.powerOn({ uhs: '', token: '' }, 'console-1')
			expect.fail('expected UNAUTHORIZED')
		} catch (error) {
			expect((error as { code?: string }).code).to.equal('UNAUTHORIZED')
		}
	})
})