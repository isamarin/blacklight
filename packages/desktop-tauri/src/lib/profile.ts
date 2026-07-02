import { trpc } from '$lib/trpc';

export type PlayedGame = {
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

export type RecentAchievement = {
	id: string;
	name: string;
	description: string;
	gamerscore: number;
	unlockedAt: string;
	iconUrl: string | null;
	titleId: string;
	titleName: string;
};

export type ProfilePlayedGames = {
	xuid: string;
	profile: {
		gamertag: string | null;
		gamerscore: string | null;
		avatarUrl: string | null;
		displayName: string | null;
	};
	games: PlayedGame[];
	recentAchievements: RecentAchievement[];
};

export function formatPlayTimeHours(minutes: number | null | undefined, unknownLabel: string): string {
	if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) {
		return unknownLabel;
	}

	const hours = minutes / 60;
	if (hours < 1) {
		return `${Math.max(1, Math.round(minutes))}m`;
	}

	return hours >= 10 ? `${Math.round(hours)}h` : `${hours.toFixed(1)}h`;
}

export function formatLastPlayed(
	value: string | null | undefined,
	locale: string,
	unknownLabel: string
): string {
	if (!value) return unknownLabel;

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return unknownLabel;

	return new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(date);
}

export async function fetchPlayedGames(
	token: { uhs: string; token: string },
	limit = 40,
	achievementLimit = 24
): Promise<ProfilePlayedGames> {
	return trpc.profile_get_played_games.query({ ...token, limit, achievementLimit });
}