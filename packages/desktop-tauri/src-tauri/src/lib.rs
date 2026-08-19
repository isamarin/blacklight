mod commands;

use std::io::{Read, Write};
use std::net::{Ipv4Addr, SocketAddr, TcpStream};
use std::sync::Mutex;
use std::time::Duration;

use tauri::{Emitter, Manager, RunEvent};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

struct ApiProcessState(Mutex<Option<CommandChild>>);

const DEFAULT_API_PORT: u16 = 9003;

fn api_port_listening(port: u16) -> bool {
	TcpStream::connect(("127.0.0.1", port)).is_ok()
}

fn api_http_health() -> bool {
	let addr = SocketAddr::from((Ipv4Addr::LOCALHOST, DEFAULT_API_PORT));
	let mut stream = match TcpStream::connect_timeout(&addr, Duration::from_millis(400)) {
		Ok(stream) => stream,
		Err(_) => return false,
	};
	let _ = stream.set_read_timeout(Some(Duration::from_millis(400)));
	let _ = stream.set_write_timeout(Some(Duration::from_millis(400)));
	if stream
		.write_all(b"GET /health HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n")
		.is_err()
	{
		return false;
	}
	let mut buf = Vec::new();
	let _ = stream.read_to_end(&mut buf);
	String::from_utf8_lossy(&buf).contains("\"ok\":true")
}

fn spawn_api(app: &tauri::AppHandle) -> Result<(), String> {
	if api_is_running(app) || api_port_listening(DEFAULT_API_PORT) {
		return Ok(());
	}

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

fn wait_port_free(port: u16) {
	for _ in 0..20 {
		if !api_port_listening(port) {
			return;
		}
		std::thread::sleep(std::time::Duration::from_millis(100));
	}
}

fn kill_api(app: &tauri::AppHandle) {
	if let Some(state) = app.try_state::<ApiProcessState>() {
		if let Some(child) = state.0.lock().unwrap().take() {
			let _ = child.kill();
		}
	}
}

fn api_is_running(app: &tauri::AppHandle) -> bool {
	let child_running = app
		.try_state::<ApiProcessState>()
		.map(|state| state.0.lock().unwrap().is_some())
		.unwrap_or(false);
	child_running || api_port_listening(DEFAULT_API_PORT)
}

#[tauri::command]
fn start_api(app: tauri::AppHandle) -> Result<(), String> {
	spawn_api(&app)
}

#[tauri::command]
fn stop_api(app: tauri::AppHandle) -> Result<(), String> {
	kill_api(&app);
	Ok(())
}

#[tauri::command]
fn is_api_running(app: tauri::AppHandle) -> bool {
	api_is_running(&app)
}

#[tauri::command]
fn restart_api(app: tauri::AppHandle) -> Result<(), String> {
	kill_api(&app);
	wait_port_free(DEFAULT_API_PORT);
	spawn_api(&app)
}

#[tauri::command]
fn api_health() -> bool {
	api_http_health()
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
			commands::get_app_settings,
			commands::save_app_settings,
			commands::get_user_token,
			commands::save_user_token,
			commands::clear_user_token,
			commands::clear_app_data,
			commands::get_api_origin,
			commands::get_trpc_url,
			start_api,
			stop_api,
			is_api_running,
			restart_api,
			api_health,
		])
		.manage(ApiProcessState(Mutex::new(None)))
		.setup(|app| {
			spawn_api(app.handle())?;
			Ok(())
		})
		.build(tauri::generate_context!())
		.expect("error while building Blacklight")
		.run(|app, event| {
			if matches!(event, RunEvent::Exit) {
				kill_api(app);
			}
		});
}