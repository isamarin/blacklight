import { expect } from 'chai'
import { appRouter, createCallerFactory } from '../src/trpc.js'

const createCaller = createCallerFactory(appRouter)

describe('appRouter', () => {
	const caller = createCaller({})

	it('ping returns pong', async function () {
		expect(await caller.ping()).to.equal('pong')
	})

	it('version returns a non-empty string', async function () {
		const version = await caller.version()
		expect(version).to.be.a('string').and.not.empty
	})

	it('echo wraps input', async function () {
		expect(await caller.echo('hello')).to.equal('echo: hello')
	})

	it('smartglass_consoles_list rejects missing token', async function () {
		try {
			await caller.smartglass_consoles_list({ uhs: '', token: '' })
			expect.fail('expected UNAUTHORIZED')
		} catch (error) {
			expect((error as { code?: string }).code).to.equal('UNAUTHORIZED')
		}
	})

	it('smartglass_console_power_on rejects missing token', async function () {
		try {
			await caller.smartglass_console_power_on({ uhs: '', token: '', consoleId: 'console-1' })
			expect.fail('expected UNAUTHORIZED')
		} catch (error) {
			expect((error as { code?: string }).code).to.equal('UNAUTHORIZED')
		}
	})
})