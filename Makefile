.PHONY: help install build build-deps build-web build-desktop \
	dev dev-clean api web web-all preview preview-all \
	test check smoke smoke-ui smoke-p0 smoke-e2e stop

PNPM := pnpm
API_PORT ?= 9003
WEB_DEV_PORT ?= 5173
WEB_PREVIEW_PORT ?= 4173

.DEFAULT_GOAL := help

help: ## Show available targets
	@echo "Blacklight — common tasks"
	@echo ""
	@grep -E '^[a-zA-Z0-9_.-]+:.*##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Ports: API=$(API_PORT)  web-dev=$(WEB_DEV_PORT)  preview=$(WEB_PREVIEW_PORT)"
	@echo ""
	@echo "Web UI only (browser):"
	@echo "  make web-all          → http://127.0.0.1:$(WEB_DEV_PORT) (hot reload)"
	@echo "  make preview-all      → http://127.0.0.1:$(WEB_PREVIEW_PORT) (prod-like, /trpc proxy)"

install: ## Install workspace dependencies
	$(PNPM) install

build-deps: ## Build shared packages (logger, player, platform)
	$(PNPM) build:deps

build: build-deps ## Alias for build-deps

build-web: build-deps ## Build SvelteKit UI only (no Tauri bundle)
	$(PNPM) build:web

build-desktop: build-deps ## Build desktop app (.dmg / .exe)
	$(PNPM) desktop-tauri tauri:build

desktop: build-desktop ## Alias for build-desktop

dev: build-deps ## Run Tauri app (native shell + preview server)
	$(PNPM) dev:tauri

dev-clean: ## Stop stale dev processes, then run Tauri
	$(PNPM) desktop-tauri tauri:stop
	$(PNPM) desktop-tauri tauri:dev:clean

api: ## Run blacklight-api on port $(API_PORT)
	BLACKLIGHT_PORT=$(API_PORT) $(PNPM) desktop-tauri api

web: build-deps ## Vite dev server only — http://127.0.0.1:$(WEB_DEV_PORT)
	TAURI_DEV_PORT=$(WEB_DEV_PORT) $(PNPM) desktop-tauri dev

web-all: build-deps ## API + Vite dev (browser, hot reload)
	@trap 'kill 0' INT TERM; \
		BLACKLIGHT_PORT=$(API_PORT) $(PNPM) desktop-tauri api & \
		TAURI_DEV_PORT=$(WEB_DEV_PORT) $(PNPM) desktop-tauri dev & \
		wait

preview: build-web ## Serve built UI — http://127.0.0.1:$(WEB_PREVIEW_PORT)
	TAURI_DEV_PREVIEW_PORT=$(WEB_PREVIEW_PORT) $(PNPM) desktop-tauri preview

preview-all: build-web ## API + preview (login/catalog; /trpc proxied)
	@trap 'kill 0' INT TERM; \
		BLACKLIGHT_PORT=$(API_PORT) $(PNPM) desktop-tauri api & \
		TAURI_DEV_PREVIEW_PORT=$(WEB_PREVIEW_PORT) $(PNPM) desktop-tauri preview & \
		wait

test: ## Run workspace tests
	$(PNPM) test

check: build-deps ## Svelte/TS check for desktop-tauri
	$(PNPM) check:tauri

smoke: smoke-ui ## Alias for smoke-ui

smoke-ui: ## Smoke test UI routes (API + Vite must be running)
	BLACKLIGHT_PORT=$(API_PORT) BLACKLIGHT_UI_PORT=$(WEB_DEV_PORT) \
		bash packages/desktop-tauri/scripts/smoke-test-ui.sh

smoke-p0: ## Smoke test P0 flows (API + Vite must be running)
	BLACKLIGHT_PORT=$(API_PORT) BLACKLIGHT_UI_PORT=$(WEB_DEV_PORT) \
		bash packages/desktop-tauri/scripts/smoke-test-p0.sh

smoke-e2e: ## Full e2e smoke test
	$(PNPM) smoke:e2e

stop: ## Stop Tauri dev server and API sidecar
	$(PNPM) desktop-tauri tauri:stop