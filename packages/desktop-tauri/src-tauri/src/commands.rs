use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInfo {
    pub version: String,
    pub product_name: String,
    pub platform: String,
    pub data_dir: String,
    pub is_tauri: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SidecarSettings {
    pub webui_autostart: bool,
    pub webui_port: u16,
}

impl Default for SidecarSettings {
    fn default() -> Self {
        Self {
            webui_autostart: true,
            webui_port: 9003,
        }
    }
}

fn settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    Ok(data_dir.join("sidecar-settings.json"))
}

fn read_settings(app: &AppHandle) -> Result<SidecarSettings, String> {
    let path = settings_path(app)?;
    if !path.exists() {
        return Ok(SidecarSettings::default());
    }
    let raw = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let patch: serde_json::Value = serde_json::from_str(&raw).map_err(|e| e.to_string())?;
    let mut settings = SidecarSettings::default();
    if let Some(v) = patch.get("webui_autostart").and_then(|v| v.as_bool()) {
        settings.webui_autostart = v;
    }
    if let Some(v) = patch.get("webui_port").and_then(|v| v.as_u64()) {
        settings.webui_port = v.clamp(1024, 65535) as u16;
    }
    Ok(settings)
}

fn write_settings(app: &AppHandle, settings: &SidecarSettings) -> Result<(), String> {
    let path = settings_path(app)?;
    let json = serde_json::to_string_pretty(settings).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_app_info(app: AppHandle) -> Result<AppInfo, String> {
    let config = app.config();
    let data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;

    Ok(AppInfo {
        version: config.version.clone().unwrap_or_else(|| "0.0.0".into()),
        product_name: config
            .product_name
            .clone()
            .unwrap_or_else(|| "Blacklight".into()),
        platform: std::env::consts::OS.into(),
        data_dir: data_dir.display().to_string(),
        is_tauri: true,
    })
}

#[tauri::command]
pub fn get_sidecar_settings(app: AppHandle) -> Result<SidecarSettings, String> {
    read_settings(&app)
}

#[tauri::command]
pub fn save_sidecar_settings(
    app: AppHandle,
    webui_autostart: Option<bool>,
    webui_port: Option<u16>,
) -> Result<SidecarSettings, String> {
    let mut settings = read_settings(&app)?;
    if let Some(v) = webui_autostart {
        settings.webui_autostart = v;
    }
    if let Some(v) = webui_port {
        settings.webui_port = v.clamp(1024, 65535);
    }
    write_settings(&app, &settings)?;
    Ok(settings)
}

#[tauri::command]
pub fn get_api_origin(app: AppHandle) -> Result<String, String> {
    let settings = read_settings(&app)?;
    Ok(format!("http://127.0.0.1:{}", settings.webui_port))
}

#[tauri::command]
pub fn get_trpc_url(app: AppHandle) -> Result<String, String> {
    Ok(format!("{}/trpc", get_api_origin(app)?))
}