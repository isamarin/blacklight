import { expect } from 'chai'
import ChatChannel from '../src/client/lib/channel/chat.ts'

class MockPeerConnection {
	senders: Array<{ track: { kind: string } | null }> = []

	addTransceiver() {
		return {}
	}

	createDataChannel() {
		return {
			onopen: null,
			onmessage: null,
			onclosing: null,
			onclose: null,
			onerror: null,
			readyState: 'open',
			send() {},
		}
	}

	addTrack() {}

	getSenders() {
		return this.senders
	}

	removeTrack() {}
}

class MockPlayer {
	_peerConnection = new MockPeerConnection()
	_sdpHandler: ((offer: RTCSessionDescriptionInit) => void) | undefined

	sdpNegotiationChat() {
		this._sdpHandler?.({ type: 'offer', sdp: 'v=0' })
	}
}

describe('ChatChannel', () => {
	it('exposes chat channel metadata', function () {
		const channel = new ChatChannel(new MockPlayer())
		expect(channel.getChannelName()).to.equal('chat')
		expect(channel.getChannelConfig()).to.deep.equal({
			ordered: true,
			protocol: 'chatV1',
		})
		expect(channel.isPaused).to.equal(true)
	})

	it('stopMic clears capture state', function () {
		const channel = new ChatChannel(new MockPlayer())
		channel.isCapturing = true
		channel.isPaused = false
		channel.stopMic()
		expect(channel.isCapturing).to.equal(false)
		expect(channel.isPaused).to.equal(true)
	})

	it('startMic rejects when permissions are denied', function () {
		const channel = new ChatChannel(new MockPlayer())
		channel._micPermissions = 'denied'
		expect(() => channel.startMic()).to.throw('Microphone permissions are denied')
	})
})