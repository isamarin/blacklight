import { expect } from 'chai'
import {
	buildPlayedGamesResponse,
	parseMinutesPlayedStats,
	parseUserstatsResponse,
	sortTitlesByLastPlayed,
	toPlayedGameSummary
} from '../src/lib/profile-played-games.js'

describe('profile-played-games', () => {
	it('sortTitlesByLastPlayed orders newest first and skips hidden titles', () => {
		const sorted = sortTitlesByLastPlayed([
			{
				titleId: '1',
				name: 'Older',
				titleHistory: { lastTimePlayed: '2024-01-01T00:00:00.000Z', visible: true }
			},
			{
				titleId: '2',
				name: 'Hidden',
				titleHistory: { lastTimePlayed: '2025-01-01T00:00:00.000Z', visible: false }
			},
			{
				titleId: '3',
				name: 'Newer',
				titleHistory: { lastTimePlayed: '2025-06-01T00:00:00.000Z', visible: true }
			}
		])

		expect(sorted.map((title) => title.titleId)).to.deep.equal(['3', '1'])
	})

	it('parseUserstatsResponse reads nested group stats', () => {
		const map = parseUserstatsResponse({
			groups: [
				{
					titleid: '987',
					statlistscollection: [
						{
							stats: [{ name: 'MinutesPlayed', value: '240' }]
						}
					]
				}
			]
		})

		expect(map.get('987')).to.equal(240)
	})

	it('parseMinutesPlayedStats maps MinutesPlayed by title id', () => {
		const map = parseMinutesPlayedStats([
			{ titleid: '123', name: 'MinutesPlayed', value: '125' },
			{ titleid: '456', name: 'OtherStat', value: '10' }
		])

		expect(map.get('123')).to.equal(125)
		expect(map.has('456')).to.equal(false)
	})

	it('toPlayedGameSummary includes hours source minutes and achievements', () => {
		const summary = toPlayedGameSummary(
			{
				titleId: '42',
				name: 'Halo',
				displayImage: 'https://example.com/box.png',
				titleHistory: { lastTimePlayed: '2025-06-01T12:00:00.000Z', visible: true },
				achievement: {
					currentAchievements: 10,
					totalAchievements: 20,
					currentGamerscore: 100,
					totalGamerscore: 200,
					progressPercentage: 50
				}
			},
			180
		)

		expect(summary.minutesPlayed).to.equal(180)
		expect(summary.achievements?.current).to.equal(10)
		expect(summary.imageUrl).to.equal('https://example.com/box.png')
	})

	it('buildPlayedGamesResponse limits output length', () => {
		const games = buildPlayedGamesResponse(
			[
				{
					titleId: '1',
					name: 'A',
					titleHistory: { lastTimePlayed: '2025-01-02T00:00:00.000Z', visible: true }
				},
				{
					titleId: '2',
					name: 'B',
					titleHistory: { lastTimePlayed: '2025-01-03T00:00:00.000Z', visible: true }
				}
			],
			new Map([['2', 60]]),
			1
		)

		expect(games).to.have.length(1)
		expect(games[0]?.titleId).to.equal('2')
		expect(games[0]?.minutesPlayed).to.equal(60)
	})
})