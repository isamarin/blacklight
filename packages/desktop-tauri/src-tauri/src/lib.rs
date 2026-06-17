use std::path::PathBuf;
use std::sync::Mutex;

use tauri::{Emitter, Manager, RunEvent};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

struct SidecarState(Mutex<Option<CommandChild>>);

fn resolve_static_dir(resource_dir: &PathBuf) -> PathBuf {
    if cfg!(debug_assertions) {
        PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../desktop-v3/app")
    } else {
        resource_dir.join("app")
    }
}

fn spawn_sidecar(app: &tauri::AppHandle) {
    let resource_dir = app
        .path()
        .resource_dir()
        .expect("failed to resolve resource dir");
    let data_dir = app
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");
    std::fs::create_dir_all(&data_dir).expect("failed to create app data dir");

    let static_dir = resolve_static_dir(&resource_dir);

    let (mut rx, child) = app
        .shell()
        .sidecar("blacklight-sidecar")
        .expect("failed to create sidecar command")
        .env("BLACKLIGHT_STATIC_DIR", static_dir)
        .env("BLACKLIGHT_DATA_DIR", data_dir)
        .spawn()
        .expect("failed to spawn sidecar");

    let app_handle = app.clone();
    tauri::async_runtime::spawn(async move {
        use tauri_plugin_shell::process::CommandEvent;
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) | CommandEvent::Stderr(line) = event {
                let text = String::from_utf8_lossy(&line);
                eprintln!("[blacklight-sidecar] {text}");
                let _ = app_handle.emit("sidecar-log", text.to_string());
            }
        }
    });

    if let Some(state) = app.try_state::<SidecarState>() {
        *state.0.lock().unwrap() = Some(child);
    }
}

fn stop_sidecar(app: &tauri::AppHandle) {
    if let Some(state) = app.try_state::<SidecarState>() {
        if let Some(child) = state.0.lock().unwrap().take() {
            let _ = child.kill();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(SidecarState(Mutex::new(None)))
        .setup(|app| {
            spawn_sidecar(app.handle());
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building Blacklight")
        .run(|app, event| {
            if matches!(event, RunEvent::Exit) {
                stop_sidecar(app);
            }
        });
}