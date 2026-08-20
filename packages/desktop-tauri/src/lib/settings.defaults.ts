import type { VideoRendererMode } from '@blacklight/player/client';
import {
	DEFAULT_ACCENT,
	DEFAULT_ACCENT_MODE,
	DEFAULT_GLASS_BLUR,
	type AccentMode
} from '$lib/appearance';

export const defaultSettings = {
	xhome_bitrate: 0,
	xcloud_bitrate: 0,
	video_renderer: 'auto' as VideoRendererMode,
	video_profiles: [] as string[],
	preferred_game_language: 'en-US',
	controller_vibration: true,
	video_size: 'default',
	force_region_ip: '',
	input_touch: false,
	input_mousekeyboard: true,
	input_mousekeyboard_config: {
		ArrowLeft: 'DPadLeft',
		ArrowUp: 'DPadUp',
		ArrowRight: 'DPadRight',
		ArrowDown: 'DPadDown',
		Enter: 'A',
		a: 'A',
		Backspace: 'B',
		b: 'B',
		x: 'X',
		y: 'Y',
		'[': 'LeftShoulder',
		']': 'RightShoulder',
		'-': 'LeftTrigger',
		'=': 'RightTrigger',
		v: 'View',
		m: 'Menu',
		n: 'Nexus'
	},
	input_newgamepad: false,
	app_lowresolution: false,
	video_enabled: true,
	audio_enabled: true,
	webui_autostart: true,
	webui_port: 9003,
	language: 'en-US',
	appearance_accent_mode: DEFAULT_ACCENT_MODE as AccentMode,
	appearance_accent: DEFAULT_ACCENT,
	appearance_glass_blur: DEFAULT_GLASS_BLUR,
	appearance_background_glow: true
};

export type AppSettings = typeof defaultSettings;