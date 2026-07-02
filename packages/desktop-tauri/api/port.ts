export type SidecarSettings = {
	webui_port?: number;
};

export function resolveApiPort(options: {
	envPort?: string;
	settings?: SidecarSettings;
}): number {
	if (options.envPort !== undefined && options.envPort !== '') {
		const port = Number(options.envPort);
		if (port >= 1024 && port <= 65535) {
			return port;
		}
	}

	const configured = Number(options.settings?.webui_port);
	if (configured >= 1024 && configured <= 65535) {
		return configured;
	}

	return 9003;
}

export function parseSidecarSettings(raw: string): SidecarSettings | undefined {
	try {
		return JSON.parse(raw) as SidecarSettings;
	} catch {
		return undefined;
	}
}