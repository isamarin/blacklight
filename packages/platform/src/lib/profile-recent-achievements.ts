export type AchievementTitleSummary = {
	titleId: number | string;
	name: string;
	lastUnlock?: string | Date | null;
	earnedAchievements?: number;
};

export type AchievementEntry = {
	id: string;
	name: string;
	description?: string;
	progressState?: string;
	isSecret?: boolean;
	progression?: {
		timeUnlocked?: string | Date | null;
	};
	mediaAssets?: Array<{ type?: string; url?: string }>;
	rewards?: Array<{ type?: string; value?: string }>;
	titleAssociations?: Array<{ name?: string; id?: number }>;
};

export type RecentAchievementSummary = {
	id: string;
	name: string;
	description: string;
	gamerscore: number;
	unlockedAt: string;
	iconUrl: string | null;
	titleId: string;
	titleName: string;
};

const DEFAULT_TITLE_SCAN = 12;
const DEFAULT_ACHIEVEMENT_LIMIT = 24;

export function parseUnlockTime(value: string | Date | null | undefined): number {
	if (!value) return 0;
	const time = value instanceof Date ? value.getTime() : Date.parse(String(value));
	return Number.isFinite(time) ? time : 0;
}

export function pickAchievementIcon(achievement: AchievementEntry): string | null {
	for (const asset of achievement.mediaAssets ?? []) {
		if (asset.type === 'Icon' && asset.url?.trim()) {
			return asset.url;
		}
	}

	for (const asset of achievement.mediaAssets ?? []) {
		if (asset.url?.trim()) {
			return asset.url;
		}
	}

	return null;
}

export function pickAchievementGamerscore(achievement: AchievementEntry): number {
	for (const reward of achievement.rewards ?? []) {
		if (reward.type !== 'Gamerscore') continue;
		const value = Number.parseInt(String(reward.value ?? ''), 10);
		if (Number.isFinite(value) && value > 0) {
			return value;
		}
	}

	return 0;
}

export function sortAchievementTitlesByLastUnlock(
	titles: AchievementTitleSummary[]
): AchievementTitleSummary[] {
	return [...titles]
		.filter((title) => (title.earnedAchievements ?? 0) > 0)
		.filter((title) => parseUnlockTime(title.lastUnlock) > 0)
		.sort((a, b) => parseUnlockTime(b.lastUnlock) - parseUnlockTime(a.lastUnlock));
}

export function toRecentAchievementSummary(
	achievement: AchievementEntry,
	titleName: string,
	titleId: string
): RecentAchievementSummary | null {
	if (achievement.progressState !== 'Achieved') return null;

	const unlockedAtMs = parseUnlockTime(achievement.progression?.timeUnlocked);
	if (unlockedAtMs <= 0) return null;

	return {
		id: achievement.id,
		name: achievement.name,
		description: achievement.description?.trim() || achievement.name,
		gamerscore: pickAchievementGamerscore(achievement),
		unlockedAt: new Date(unlockedAtMs).toISOString(),
		iconUrl: pickAchievementIcon(achievement),
		titleId,
		titleName
	};
}

export function mergeRecentAchievements(
	entries: RecentAchievementSummary[],
	limit = DEFAULT_ACHIEVEMENT_LIMIT
): RecentAchievementSummary[] {
	return [...entries]
		.sort((a, b) => parseUnlockTime(b.unlockedAt) - parseUnlockTime(a.unlockedAt))
		.slice(0, limit);
}

export function getTitlesToScanForAchievements(
	titles: AchievementTitleSummary[],
	limit = DEFAULT_TITLE_SCAN
): AchievementTitleSummary[] {
	return sortAchievementTitlesByLastUnlock(titles).slice(0, limit);
}