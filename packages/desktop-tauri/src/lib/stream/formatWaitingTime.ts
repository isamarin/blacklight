export function formatWaitingTime(
	rawSeconds: number,
	labels: { hours: string; minutes: string; seconds: string }
): string {
	const hours = Math.floor(rawSeconds / 3600);
	const minutes = Math.floor((rawSeconds % 3600) / 60);
	const seconds = (rawSeconds % 3600) % 60;
	const parts: string[] = [];

	if (hours > 0) parts.push(`${hours} ${labels.hours}`);
	if (minutes > 0) parts.push(`${minutes} ${labels.minutes}`);
	if (seconds > 0) parts.push(`${seconds} ${labels.seconds}`);

	return parts.join(', ') || `0 ${labels.seconds}`;
}