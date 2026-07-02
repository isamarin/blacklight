<script lang="ts">
	import { onMount } from 'svelte';
	import { classifyError, extractErrorMessage, type UserErrorCode } from '$lib/errors';
	import { i18n, t } from '$lib/i18n';
	import {
		fetchPlayedGames,
		formatLastPlayed,
		formatPlayTimeHours,
		type ProfilePlayedGames
	} from '$lib/profile';
	import { getAuthState, getWebToken } from '$lib/stores/auth.svelte';
	import AppLayout from '$lib/components/layout/AppLayout.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import ErrorPanel from '$lib/components/ui/ErrorPanel.svelte';
	import CachedImage from '$lib/components/ui/CachedImage.svelte';
	import Loader from '$lib/components/ui/Loader.svelte';

	const PROFILE_TILE_LIMIT = 6;

	type TokenProfile = {
		gtg?: string;
		xid?: string;
		gsu?: string;
	};

	let loading = $state(true);
	let profileData = $state<ProfilePlayedGames | null>(null);
	let errorCode = $state<UserErrorCode | null>(null);
	let errorDetail = $state<string | null>(null);

	const authState = $derived(getAuthState());
	const tokenProfile = $derived(
		authState.webToken?.data.DisplayClaims?.xui?.[0] as TokenProfile | undefined
	);

	const displayName = $derived(
		profileData?.profile.displayName ||
			profileData?.profile.gamertag ||
			tokenProfile?.gtg ||
			t('page.profile.pageTitle')
	);

	const gamerscore = $derived(profileData?.profile.gamerscore || tokenProfile?.gsu || null);
	const avatarUrl = $derived(profileData?.profile.avatarUrl || null);
	const xuid = $derived(profileData?.xuid || tokenProfile?.xid || '—');
	const games = $derived((profileData?.games ?? []).slice(0, PROFILE_TILE_LIMIT));
	const recentAchievements = $derived(
		(profileData?.recentAchievements ?? []).slice(0, PROFILE_TILE_LIMIT)
	);
	const locale = $derived(i18n.language || 'en-US');

	async function loadProfile() {
		const token = getWebToken();
		if (!token.token || !token.uhs) {
			errorCode = 'web_tokens';
			errorDetail = null;
			profileData = null;
			loading = false;
			return;
		}

		loading = true;
		errorCode = null;
		errorDetail = null;

		try {
			profileData = await fetchPlayedGames(token, PROFILE_TILE_LIMIT, PROFILE_TILE_LIMIT);
		} catch (error) {
			errorCode = classifyError(error);
			errorDetail = extractErrorMessage(error);
			profileData = null;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void loadProfile();
	});
</script>

<AppLayout title={t('page.profile.pageTitle')}>
	{#if loading}
		<Loader />
	{:else if errorCode}
		<ErrorPanel code={errorCode} detail={errorDetail} onRetry={loadProfile} />
	{:else}
		<div class="mx-auto flex w-full max-w-6xl flex-col gap-8">
			<Card class="flex flex-col gap-5 sm:flex-row sm:items-center">
				<div class="flex items-center gap-4">
					{#if avatarUrl}
						<img
							src={avatarUrl}
							alt=""
							class="h-20 w-20 rounded-2xl border border-white/10 object-cover"
							loading="lazy"
						/>
					{:else}
						<div
							class="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl font-bold text-white/70"
						>
							{displayName.slice(0, 1).toUpperCase()}
						</div>
					{/if}

					<div>
						<h1 class="text-2xl font-bold text-white">{displayName}</h1>
						{#if profileData?.profile.gamertag && profileData.profile.gamertag !== displayName}
							<p class="text-sm text-white/50">{profileData.profile.gamertag}</p>
						{/if}
						<p class="mt-1 text-sm text-white/45">
							{t('page.profile.xuidLabel')}: {xuid}
						</p>
					</div>
				</div>

				{#if gamerscore}
					<div class="glass-pill glass-pill-default sm:ml-auto">
						{t('page.profile.gamerscoreLabel')}: {gamerscore}
					</div>
				{/if}
			</Card>

			<section>
				<div class="mb-4">
					<h2 class="text-lg font-semibold text-white">{t('page.profile.recentlyPlayed')}</h2>
					<p class="text-sm text-white/45">{t('page.profile.recentlyPlayedHint')}</p>
				</div>

				{#if games.length === 0}
					<Card>
						<p class="text-sm text-white/50">{t('page.profile.noPlayedGames')}</p>
					</Card>
				{:else}
					<div class="profile-tile-grid">
						{#each games as game (game.titleId)}
							<article class="profile-game-tile">
								{#if game.imageUrl}
									<CachedImage
										src={game.imageUrl}
										preset="cover"
										alt=""
										class="profile-game-tile-image"
									/>
								{:else}
									<div class="profile-game-tile-fallback">?</div>
								{/if}

								<div class="profile-game-hours">
									<span class="profile-game-hours-value">
										{formatPlayTimeHours(
											game.minutesPlayed,
											t('page.profile.playTimeUnknown')
										)}
									</span>
									<span class="profile-game-hours-label">
										{t('page.profile.playTimeLabel')}
									</span>
								</div>

								<div class="profile-tile-overlay">
									<p class="profile-tile-title">{game.name}</p>
									<p class="profile-tile-meta">
										{formatLastPlayed(
											game.lastPlayed,
											locale,
											t('page.profile.lastPlayedUnknown')
										)}
									</p>
								</div>
							</article>
						{/each}
					</div>
				{/if}
			</section>

			<section>
				<div class="mb-4">
					<h2 class="text-lg font-semibold text-white">{t('page.profile.recentAchievements')}</h2>
					<p class="text-sm text-white/45">{t('page.profile.recentAchievementsHint')}</p>
				</div>

				{#if recentAchievements.length === 0}
					<Card>
						<p class="text-sm text-white/50">{t('page.profile.noRecentAchievements')}</p>
					</Card>
				{:else}
					<div class="profile-tile-grid">
						{#each recentAchievements as achievement (achievement.id + achievement.unlockedAt)}
							<article class="profile-achievement-tile">
								{#if achievement.iconUrl}
									<CachedImage
										src={achievement.iconUrl}
										preset="icon"
										alt=""
										class="profile-achievement-tile-icon"
									/>
								{:else}
									<div class="profile-achievement-tile-fallback">★</div>
								{/if}

								{#if achievement.gamerscore > 0}
									<div class="profile-tile-badge">+{achievement.gamerscore}G</div>
								{/if}

								<div class="profile-tile-overlay">
									<p class="profile-tile-title">{achievement.name}</p>
									<p class="profile-tile-meta">{achievement.titleName}</p>
									<p class="profile-tile-meta">
										{formatLastPlayed(
											achievement.unlockedAt,
											locale,
											t('page.profile.lastPlayedUnknown')
										)}
									</p>
								</div>
							</article>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	{/if}
</AppLayout>