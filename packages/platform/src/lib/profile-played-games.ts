export type TitleHistoryTitle = {
	titleId: string;
	name: string;
	type?: string;
	displayImage?: string | null;
	images?: Array<{ url?: string; type?: string }>;
	titleHistory?: {
		lastTimePlayed?: string | Date | null;
		visible?: boolean;
	};
	achievement?: {
		currentAchievements?: number;
		totalAchievements?: number;
		currentGamerscore?: number;
		totalGamerscore?: number;
		progressPercentage?: number;
	};
};

export type PlayedGameSummary = {
	titleId: string;
	name: string;
	imageUrl: string | null;
	lastPlayed: string | null;
	minutesPlayed: number | null;
	achievements: {
		current: number;
		total: number;
		gamerscore: number;
		maxGamerscore: number;
		progressPercentage: number;
	} | null;
};

const DEFAULT_LIMIT = 40;
const STATS_CHUNK_SIZE = 20;

export function parseLastPlayed(value: string | Date | null | undefined): number {
	if (!value) return 0;
	const time = value instanceof Date ? value.getTime() : Date.parse(String(value));
	return Number.isFinite(time) ? time : 0;
}

export function pickTitleImage(title: TitleHistoryTitle): string | null {
	if (title.displayImage?.trim()) {
		return title.displayImage;
	}

	for (const image of title.images ?? []) {
		if (image.type === 'BoxArt' && image.url?.trim()) {
			return image.url;
		}
	}

	for (const image of title.images ?? []) {
		if (image.url?.trim()) {
			return image.url;
		}
	}

	return null;
}

export function sortTitlesByLastPlayed(titles: TitleHistoryTitle[]): TitleHistoryTitle[] {
	return [...titles]
		.filter((title) => title.titleHistory?.visible !== false)
		.filter((title) => parseLastPlayed(title.titleHistory?.lastTimePlayed) > 0)
		.sort(
			(a, b) =>
				parseLastPlayed(b.titleHistory?.lastTimePlayed) -
				parseLastPlayed(a.titleHistory?.lastTimePlayed)
		);
}

export function toPlayedGameSummary(
	title: TitleHistoryTitle,
	minutesPlayed: number | null
): PlayedGameSummary {
	const lastPlayedMs = parseLastPlayed(title.titleHistory?.lastTimePlayed);
	const achievement = title.achievement;

	return {
		titleId: title.titleId,
		name: title.name,
		imageUrl: pickTitleImage(title),
		lastPlayed: lastPlayedMs > 0 ? new Date(lastPlayedMs).toISOString() : null,
		minutesPlayed,
		achievements:
			achievement &&
			typeof achievement.totalAchievements === 'number' &&
			achievement.totalAchievements > 0
				? {
						current: achievement.currentAchievements ?? 0,
						total: achievement.totalAchievements,
						gamerscore: achievement.currentGamerscore ?? 0,
						maxGamerscore: achievement.totalGamerscore ?? 0,
						progressPercentage: achievement.progressPercentage ?? 0
					}
				: null
	};
}

export function chunkTitleIds(titleIds: string[], chunkSize = STATS_CHUNK_SIZE): string[][] {
	const chunks: string[][] = [];
	for (let index = 0; index < titleIds.length; index += chunkSize) {
		chunks.push(titleIds.slice(index, index + chunkSize));
	}
	return chunks;
}

type UserstatRecord = {
	titleid?: string;
	titleId?: string;
	name?: string;
	value?: string;
};

type UserstatsResponse = {
	statlistscollection?: UserstatRecord[];
	groups?: Array<{
		titleid?: string;
		titleId?: string;
		statlistscollection?: Array<{ stats?: UserstatRecord[] }>;
	}>;
};

function statTitleId(stat: UserstatRecord): string | undefined {
	const titleId = stat.titleid ?? stat.titleId;
	return typeof titleId === 'string' && titleId.trim() ? titleId.trim() : undefined;
}

export function flattenUserstats(response: UserstatsResponse | undefined): UserstatRecord[] {
	const stats: UserstatRecord[] = [...(response?.statlistscollection ?? [])];

	for (const group of response?.groups ?? []) {
		const groupTitleId = group.titleid ?? group.titleId;
		for (const collection of group.statlistscollection ?? []) {
			for (const stat of collection.stats ?? []) {
				stats.push({
					...stat,
					titleid: statTitleId(stat) ?? groupTitleId
				});
			}
		}
	}

	return stats;
}

export function parseMinutesPlayedStats(
	stats: Array<UserstatRecord> | undefined
): Map<string, number> {
	const minutesByTitle = new Map<string, number>();

	for (const stat of stats ?? []) {
		if (stat.name !== 'MinutesPlayed') continue;
		const titleId = statTitleId(stat);
		if (!titleId) continue;
		const minutes = Number.parseInt(String(stat.value ?? ''), 10);
		if (!Number.isFinite(minutes) || minutes < 0) continue;
		minutesByTitle.set(titleId, minutes);
	}

	return minutesByTitle;
}

export function parseUserstatsResponse(response: UserstatsResponse | undefined): Map<string, number> {
	return parseMinutesPlayedStats(flattenUserstats(response));
}

export function getMinutesForTitle(
	minutesByTitle: Map<string, number>,
	titleId: string
): number | null {
	const key = String(titleId);
	return minutesByTitle.get(key) ?? null;
}

export function buildPlayedGamesResponse(
	titles: TitleHistoryTitle[],
	minutesByTitle: Map<string, number>,
	limit = DEFAULT_LIMIT
) {
	const sorted = sortTitlesByLastPlayed(titles).slice(0, limit);

	return sorted.map((title) =>
		toPlayedGameSummary(title, getMinutesForTitle(minutesByTitle, title.titleId))
	);
}

export function extractProfileSettings(
	settings: Array<{ id?: string; value?: string }> | undefined
) {
	const values = new Map((settings ?? []).map((setting) => [setting.id, setting.value]));

	return {
		gamertag: values.get('Gamertag') ?? null,
		gamerscore: values.get('Gamerscore') ?? null,
		avatarUrl: values.get('GameDisplayPicRaw') ?? null,
		displayName: values.get('GameDisplayName') ?? null
	};
}