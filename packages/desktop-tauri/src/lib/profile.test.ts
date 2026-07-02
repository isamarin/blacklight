import { describe, expect, it } from 'vitest';
import { formatLastPlayed, formatPlayTimeHours } from '$lib/profile';

describe('profile formatting', () => {
	it('formatPlayTimeHours renders minutes for short sessions', () => {
		expect(formatPlayTimeHours(45, '—')).to.equal('45m');
	});

	it('formatPlayTimeHours renders decimal hours', () => {
		expect(formatPlayTimeHours(150, '—')).to.equal('2.5h');
	});

	it('formatPlayTimeHours renders unknown label when missing', () => {
		expect(formatPlayTimeHours(null, '—')).to.equal('—');
	});

	it('formatLastPlayed formats valid dates', () => {
		const formatted = formatLastPlayed('2025-06-01T12:00:00.000Z', 'en-US', 'Unknown');
		expect(formatted).to.match(/2025/);
	});
});