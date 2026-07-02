import { expect } from 'chai'
import {
	mergeRecentAchievements,
	sortAchievementTitlesByLastUnlock,
	toRecentAchievementSummary
} from '../src/lib/profile-recent-achievements.js'

describe('profile-recent-achievements', () => {
	it('sortAchievementTitlesByLastUnlock orders by last unlock', () => {
		const sorted = sortAchievementTitlesByLastUnlock([
			{ titleId: 1, name: 'Old', earnedAchievements: 2, lastUnlock: '2024-01-01T00:00:00.000Z' },
			{ titleId: 2, name: 'New', earnedAchievements: 1, lastUnlock: '2025-06-01T00:00:00.000Z' },
			{ titleId: 3, name: 'None', earnedAchievements: 0, lastUnlock: '2025-07-01T00:00:00.000Z' }
		])

		expect(sorted.map((title) => title.titleId)).to.deep.equal([2, 1])
	})

	it('toRecentAchievementSummary maps unlocked achievements', () => {
		const summary = toRecentAchievementSummary(
			{
				id: 'a1',
				name: 'First Steps',
				description: 'Complete the tutorial',
				progressState: 'Achieved',
				progression: { timeUnlocked: '2025-06-02T10:00:00.000Z' },
				mediaAssets: [{ type: 'Icon', url: 'https://example.com/icon.png' }],
				rewards: [{ type: 'Gamerscore', value: '10' }]
			},
			'Halo',
			'123'
		)

		expect(summary?.titleName).to.equal('Halo')
		expect(summary?.gamerscore).to.equal(10)
		expect(summary?.iconUrl).to.equal('https://example.com/icon.png')
	})

	it('mergeRecentAchievements keeps newest first and applies limit', () => {
		const merged = mergeRecentAchievements(
			[
				{
					id: '1',
					name: 'A',
					description: 'A',
					gamerscore: 5,
					unlockedAt: '2025-01-01T00:00:00.000Z',
					iconUrl: null,
					titleId: '1',
					titleName: 'Game A'
				},
				{
					id: '2',
					name: 'B',
					description: 'B',
					gamerscore: 10,
					unlockedAt: '2025-06-01T00:00:00.000Z',
					iconUrl: null,
					titleId: '2',
					titleName: 'Game B'
				}
			],
			1
		)

		expect(merged).to.have.length(1)
		expect(merged[0]?.id).to.equal('2')
	})
})