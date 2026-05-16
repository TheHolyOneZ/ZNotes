mod db;
mod models;
mod commands;

use std::collections::HashSet;
use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, Ordering};
use rusqlite::Connection;
use commands::{DbState, CloseToTray, CloseFlagArc};
use tauri::{Manager, Emitter, image::Image};
use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
#[cfg(not(target_os = "linux"))]
use tauri_plugin_notification::NotificationExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let data_dir = app.path().app_data_dir().expect("failed to get data dir");
            std::fs::create_dir_all(&data_dir).expect("failed to create data dir");
            let db_path = data_dir.join("znotes.db");
            let conn = Connection::open(&db_path).expect("failed to open database");
            db::init(&conn).expect("failed to initialize database");

            let close_to_tray_enabled: bool = conn
                .query_row(
                    "SELECT value FROM settings WHERE key='close_to_tray'",
                    [],
                    |r| r.get::<_, String>(0),
                )
                .map(|v| v == "true")
                .unwrap_or(false);

            app.manage(DbState(Mutex::new(conn)));
            app.manage(CloseToTray(AtomicBool::new(close_to_tray_enabled)));


            let open_item = MenuItemBuilder::with_id("open", "Open ZNotes").build(app)?;
            let quit_item = MenuItemBuilder::with_id("quit", "Quit ZNotes").build(app)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let tray_menu = MenuBuilder::new(app)
                .items(&[&open_item, &separator, &quit_item])
                .build()?;

            let icon = Image::from_bytes(include_bytes!("../icons/icon.png"))?;

            TrayIconBuilder::with_id("main")
                .icon(icon)
                .tooltip("ZNotes")
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| {
                    match event.id.as_ref() {
                        "open" => show_window(app),
                        "quit" => app.exit(0),
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click {
                        button: tauri::tray::MouseButton::Left,
                        button_state: tauri::tray::MouseButtonState::Up,
                        ..
                    } = event {
                        show_window(tray.app_handle());
                    }
                })
                .build(app)?;


            let close_flag = app.state::<CloseToTray>().0.load(Ordering::Relaxed);
            let close_flag = std::sync::Arc::new(AtomicBool::new(close_flag));
            app.manage(CloseFlagArc(close_flag.clone()));

            if let Some(window) = app.get_webview_window("main") {
                let win = window.clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        if close_flag.load(Ordering::Relaxed) {
                            api.prevent_close();
                            let _ = win.hide();
                        }
                    }
                });
            }


            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_secs(5)).await;
                loop {

                    let mut fired: HashSet<String> = HashSet::new();
                    check_reminders(&handle, &mut fired);
                    tokio::time::sleep(std::time::Duration::from_secs(60)).await;
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_notes,
            commands::create_note,
            commands::update_note,
            commands::delete_note,
            commands::pin_note,
            commands::get_checklists,
            commands::create_checklist,
            commands::update_checklist,
            commands::delete_checklist,
            commands::pin_checklist,
            commands::pull_checklist_to_today,
            commands::add_checklist_item,
            commands::toggle_checklist_item,
            commands::update_checklist_item,
            commands::delete_checklist_item,
            commands::replace_checklist_items,
            commands::reorder_checklist_items,
            commands::get_settings,
            commands::update_setting,
            commands::reset_app_data,
            commands::window_minimize,
            commands::window_maximize,
            commands::window_close,
            commands::clear_reminder,
            commands::snooze_reminder,
            commands::set_close_to_tray,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn show_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}


fn fire_os_notification(handle: &tauri::AppHandle, title: &str, body: &str) {
    #[cfg(target_os = "linux")]
    {
        let _ = notify_rust::Notification::new()
            .appname("ZNotes")
            .summary(title)
            .body(body)
            .urgency(notify_rust::Urgency::Critical)
            .timeout(notify_rust::Timeout::Never)
            .show();
    }

    #[cfg(not(target_os = "linux"))]
    {
        let _ = handle.notification()
            .builder()
            .title(title)
            .body(body)
            .sound("Default")
            .show();
    }


    #[cfg(target_os = "linux")]
    let _ = handle;
}

fn check_reminders(handle: &tauri::AppHandle, fired: &mut HashSet<String>) {
    let now = chrono::Utc::now().to_rfc3339();
    let state = match handle.try_state::<DbState>() {
        Some(s) => s,
        None => return,
    };
    let conn = match state.0.lock() {
        Ok(c) => c,
        Err(_) => return,
    };

    let due_notes: Vec<(String, String, String)> = {
        let Ok(mut stmt) = conn.prepare_cached(
            "SELECT id, title, COALESCE(content,'') FROM notes WHERE reminder IS NOT NULL AND reminder <= ?1"
        ) else { return; };
        stmt.query_map([&now], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
            .unwrap_or_default()
    };

    let due_checklists: Vec<(String, String, String)> = {
        let Ok(mut stmt) = conn.prepare_cached(
            "SELECT id, title, COALESCE(category,'') FROM checklists WHERE reminder IS NOT NULL AND reminder <= ?1"
        ) else { return; };
        stmt.query_map([&now], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)))
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
            .unwrap_or_default()
    };

    for (id, title, content) in &due_notes {
        let key = format!("note:{id}");
        if fired.contains(&key) { continue; }
        fired.insert(key);

        let body = if content.is_empty() {
            "Tap to open your note in ZNotes".to_string()
        } else {
            let s: String = content.chars().take(120).collect();
            if content.len() > 120 { format!("{s}…") } else { s }
        };

        fire_os_notification(handle, title, &body);
        let _ = handle.emit("znotes:reminder-fired", serde_json::json!({
            "kind": "note", "id": id, "title": title, "body": body,
        }));
        let _ = conn.execute("UPDATE notes SET reminder=NULL, updated_at=?1 WHERE id=?2", [&now, id]);
    }

    for (id, title, category) in &due_checklists {
        let key = format!("checklist:{id}");
        if fired.contains(&key) { continue; }
        fired.insert(key);

        let body = if category.is_empty() {
            "Checklist reminder — tap to review in ZNotes".to_string()
        } else {
            format!("{category} — tap to review in ZNotes")
        };

        fire_os_notification(handle, title, &body);
        let _ = handle.emit("znotes:reminder-fired", serde_json::json!({
            "kind": "checklist", "id": id, "title": title, "body": body,
        }));
        let _ = conn.execute("UPDATE checklists SET reminder=NULL, updated_at=?1 WHERE id=?2", [&now, id]);
    }
}
