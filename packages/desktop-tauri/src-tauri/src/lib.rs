mod commands;

use std::sync::Mutex;

use tauri::{Emitter, Manager, RunEvent};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

struct ApiProcessState(Mutex<Option<CommandChild>>);

fn spawn_api(app: &tauri::AppHandle) -> Result<(), String> {
	let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
	std::fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;

	let (mut rx, child) = app
		.shell()
		.sidecar("blacklight-api")
		.map_err(|e| e.to_string())?
		.env("BLACKLIGHT_DATA_DIR", data_dir)
		.spawn()
		.map_err(|e| e.to_string())?;

	let app_handle = app.clone();
	tauri::async_runtime::spawn(async move {
		use tauri_plugin_shell::process::CommandEvent;
		while let Some(event) = rx.recv().await {
			if let CommandEvent::Stdout(line) | CommandEvent::Stderr(line) = event {
				let text = String::from_utf8_lossy(&line);
				eprintln!("[blacklight-api] {text}");
				let _ = app_handle.emit("api-log", text.to_string());
			}
		}
	});

	if let Some(state) = app.try_state::<ApiProcessState>() {
		*state.0.lock().unwrap() = Some(child);
	}

	Ok(())
}

fn stop_api(app: &tauri::AppHandle) {
	if let Some(state) = app.try_state::<ApiProcessState>() {
		if let Some(child) = state.0.lock().unwrap().take() {
			let _ = child.kill();
		}
	}
}

#[tauri::command]
fn restart_api(app: tauri::AppHandle) -> Result<(), String> {
	stop_api(&app);
	spawn_api(&app)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
	tauri::Builder::default()
		.plugin(tauri_plugin_shell::init())
		.plugin(tauri_plugin_opener::init())
		.invoke_handler(tauri::generate_handler![
			commands::get_app_info,
			commands::get_sidecar_settings,
			commands::save_sidecar_settings,
			commands::get_api_origin,
			commands::get_trpc_url,
			restart_api,
		])
		.manage(ApiProcessState(Mutex::new(None)))
		.setup(|app| {
			spawn_api(app.handle()).expect("failed to spawn blacklight-api");
			Ok(())
		})
		.build(tauri::generate_context!())
		.expect("error while building Blacklight")
		.run(|app, event| {
			if matches!(event, RunEvent::Exit) {
				stop_api(app);
			}
		});
}