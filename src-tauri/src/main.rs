#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
mod command;
mod config;
mod http;
mod tray;
mod models;

use tauri::Manager;
use tokio::sync::{mpsc, Mutex};
use tokio::time::Duration;
use tauri_plugin_autostart::MacosLauncher;
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};
use std::fs;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct GitlabConfig {
    url: String,
    token: String,
    interval: u64, // 新增间隔时间字段
}

#[tauri::command]
fn save_gitlab_config(url: String, token: String, interval: u64) -> Result<(), String> {
    let config = GitlabConfig { url, token, interval };
    let config_str = serde_json::to_string(&config).map_err(|e| e.to_string())?;
    fs::write("gitlab_config.json", config_str).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_gitlab_config() -> Result<GitlabConfig, String> {
    let config_str = fs::read_to_string("gitlab_config.json").map_err(|e| e.to_string())?;
    let config: GitlabConfig = serde_json::from_str(&config_str).map_err(|e| e.to_string())?;
    Ok(config)
}

pub struct AsyncProcInputTx {
  pub cron_sender: Mutex<mpsc::Sender<u64>>,
}

struct Senders {
  pub cron_sender: mpsc::Sender<u64>,
}

fn init_tauri() {

  let (cron_input_tx, cron_input_rx) = mpsc::channel::<u64>(32);
  let cron_tx = cron_input_tx.clone();

  let interval = if config::AppConfig::get_config().interval > 0 {
    Duration::from_secs(config::AppConfig::get_config().interval)
  } else {
    Duration::from_secs(1800)
  };

  #[allow(unused_mut)]
  let mut builder = tauri::Builder::default()
    .manage(AsyncProcInputTx {
      cron_sender: Mutex::new(cron_input_tx),
    })
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_positioner::init())
    .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, None))
    .setup(move |app| {
      #[cfg(all(desktop))]
      {
        let handle = app.handle();
        tray::create_tray(&handle, {
          Senders {
            cron_sender: cron_tx.clone(),
          }
        })?;
      }

      // hide dock icon on macos
      #[cfg(target_os = "macos")]
      app.set_activation_policy(tauri::ActivationPolicy::Accessory);

      let window = app.get_webview_window("main").unwrap();

      #[cfg(target_os = "macos")]
      apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, Some(8.0))
          .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

      #[cfg(target_os = "windows")]
      apply_blur(&window, Some((18, 18, 18, 125)))
          .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

      // app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;

      Ok(())
    });

    #[allow(unused_mut)]
    let mut _app = builder
      .invoke_handler(tauri::generate_handler![
        command::set_wallpaper,
        command::save_wallpaper,
        command::get_config,
        command::write_config,
      ])
      .run(tauri::generate_context!())
      .expect("error while building tauri application");
}


#[tokio::main]
async fn main() {
  config::AppConfig::get_app_folder().expect("create app folder failed!");
  init_tauri();
}
