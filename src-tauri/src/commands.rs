use std::sync::Mutex;
use std::sync::atomic::{AtomicBool, Ordering};
use rusqlite::Connection;
use uuid::Uuid;
use chrono::Utc;
use crate::models::*;

pub struct DbState(pub Mutex<Connection>);
pub struct CloseToTray(pub AtomicBool);
pub struct CloseFlagArc(pub std::sync::Arc<AtomicBool>);

fn now() -> String {
    Utc::now().to_rfc3339()
}

fn new_id() -> String {
    Uuid::new_v4().to_string()
}


#[tauri::command]
pub fn get_notes(state: tauri::State<DbState>) -> Result<Vec<Note>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, title, content, tags, pinned, color, reminder, created_at, updated_at
         FROM notes ORDER BY pinned DESC, updated_at DESC"
    ).map_err(|e| e.to_string())?;

    let notes = stmt.query_map([], |row| {
        let tags_str: String = row.get(3)?;
        let tags: Vec<String> = serde_json::from_str(&tags_str).unwrap_or_default();
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            tags,
            pinned: row.get::<_, i32>(4)? != 0,
            color: row.get(5)?,
            reminder: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
        })
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    Ok(notes)
}

#[tauri::command]
pub fn create_note(state: tauri::State<DbState>, input: CreateNoteInput) -> Result<Note, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let id = new_id();
    let now = now();
    let tags_json = serde_json::to_string(&input.tags).unwrap_or_default();

    conn.execute(
        "INSERT INTO notes (id, title, content, tags, pinned, color, reminder, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, 0, ?5, ?6, ?7, ?7)",
        rusqlite::params![id, input.title, input.content, tags_json, input.color, input.reminder, now],
    ).map_err(|e| e.to_string())?;

    Ok(Note {
        id,
        title: input.title,
        content: input.content,
        tags: input.tags,
        pinned: false,
        color: input.color,
        reminder: input.reminder,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_note(state: tauri::State<DbState>, input: UpdateNoteInput) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let tags_json = serde_json::to_string(&input.tags).unwrap_or_default();
    let now = now();

    conn.execute(
        "UPDATE notes SET title=?1, content=?2, tags=?3, pinned=?4, color=?5, reminder=?6, updated_at=?7 WHERE id=?8",
        rusqlite::params![input.title, input.content, tags_json, input.pinned as i32, input.color, input.reminder, now, input.id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_note(state: tauri::State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM notes WHERE id=?1", [&id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn pin_note(state: tauri::State<DbState>, id: String, pinned: bool) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("UPDATE notes SET pinned=?1 WHERE id=?2", rusqlite::params![pinned as i32, id])
        .map_err(|e| e.to_string())?;
    Ok(())
}


fn load_items(conn: &Connection, checklist_id: &str) -> Result<Vec<ChecklistItem>, rusqlite::Error> {
    let mut stmt = conn.prepare(
        "SELECT id, checklist_id, text, completed, priority, position FROM checklist_items
         WHERE checklist_id=?1 ORDER BY position ASC"
    )?;
    let rows = stmt.query_map([checklist_id], |row| Ok(ChecklistItem {
        id: row.get(0)?,
        checklist_id: row.get(1)?,
        text: row.get(2)?,
        completed: row.get::<_, i32>(3)? != 0,
        priority: row.get(4)?,
        position: row.get(5)?,
    }))?;
    rows.collect()
}

#[tauri::command]
pub fn get_checklists(state: tauri::State<DbState>) -> Result<Vec<Checklist>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, title, category, tags, scheduled_date, pinned, reminder, created_at, updated_at
         FROM checklists ORDER BY pinned DESC, scheduled_date ASC, updated_at DESC"
    ).map_err(|e| e.to_string())?;

    let checklists = stmt.query_map([], |row| {
        let tags_str: String = row.get(3)?;
        let tags: Vec<String> = serde_json::from_str(&tags_str).unwrap_or_default();
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            tags,
            row.get::<_, Option<String>>(4)?,
            row.get::<_, i32>(5)? != 0,
            row.get::<_, Option<String>>(6)?,
            row.get::<_, String>(7)?,
            row.get::<_, String>(8)?,
        ))
    }).map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for (id, title, category, tags, scheduled_date, pinned, reminder, created_at, updated_at) in checklists {
        let items = load_items(&conn, &id).map_err(|e| e.to_string())?;
        result.push(Checklist { id, title, category, tags, scheduled_date, pinned, reminder, created_at, updated_at, items });
    }

    Ok(result)
}

#[tauri::command]
pub fn create_checklist(state: tauri::State<DbState>, input: CreateChecklistInput) -> Result<Checklist, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let id = new_id();
    let now = now();
    let tags_json = serde_json::to_string(&input.tags).unwrap_or_default();

    conn.execute(
        "INSERT INTO checklists (id, title, category, tags, scheduled_date, pinned, reminder, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, 0, ?6, ?7, ?7)",
        rusqlite::params![id, input.title, input.category, tags_json, input.scheduled_date, input.reminder, now],
    ).map_err(|e| e.to_string())?;

    let mut items = Vec::new();
    for (pos, item) in input.items.iter().enumerate() {
        let item_id = new_id();
        conn.execute(
            "INSERT INTO checklist_items (id, checklist_id, text, completed, priority, position) VALUES (?1, ?2, ?3, 0, ?4, ?5)",
            rusqlite::params![item_id, id, item.text, item.priority, pos as i32],
        ).map_err(|e| e.to_string())?;
        items.push(ChecklistItem {
            id: item_id, checklist_id: id.clone(), text: item.text.clone(),
            completed: false, priority: item.priority.clone(), position: pos as i32,
        });
    }

    Ok(Checklist {
        id, title: input.title, category: input.category, tags: input.tags,
        scheduled_date: input.scheduled_date, pinned: false, reminder: input.reminder,
        created_at: now.clone(), updated_at: now, items,
    })
}

#[tauri::command]
pub fn update_checklist(state: tauri::State<DbState>, input: UpdateChecklistInput) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let tags_json = serde_json::to_string(&input.tags).unwrap_or_default();
    let now = now();

    conn.execute(
        "UPDATE checklists SET title=?1, category=?2, tags=?3, scheduled_date=?4, pinned=?5, reminder=?6, updated_at=?7 WHERE id=?8",
        rusqlite::params![input.title, input.category, tags_json, input.scheduled_date, input.pinned as i32, input.reminder, now, input.id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_checklist(state: tauri::State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM checklists WHERE id=?1", [&id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn pin_checklist(state: tauri::State<DbState>, id: String, pinned: bool) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("UPDATE checklists SET pinned=?1 WHERE id=?2", rusqlite::params![pinned as i32, id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn pull_checklist_to_today(state: tauri::State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    conn.execute("UPDATE checklists SET scheduled_date=?1 WHERE id=?2", rusqlite::params![today, id])
        .map_err(|e| e.to_string())?;
    Ok(())
}


#[tauri::command]
pub fn add_checklist_item(state: tauri::State<DbState>, input: AddItemInput) -> Result<ChecklistItem, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let id = new_id();
    let pos: i32 = conn.query_row(
        "SELECT COALESCE(MAX(position) + 1, 0) FROM checklist_items WHERE checklist_id=?1",
        [&input.checklist_id],
        |row| row.get(0),
    ).unwrap_or(0);

    conn.execute(
        "INSERT INTO checklist_items (id, checklist_id, text, completed, priority, position) VALUES (?1, ?2, ?3, 0, ?4, ?5)",
        rusqlite::params![id, input.checklist_id, input.text, input.priority, pos],
    ).map_err(|e| e.to_string())?;

    Ok(ChecklistItem {
        id, checklist_id: input.checklist_id, text: input.text,
        completed: false, priority: input.priority, position: pos,
    })
}

#[tauri::command]
pub fn toggle_checklist_item(state: tauri::State<DbState>, id: String, completed: bool) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("UPDATE checklist_items SET completed=?1 WHERE id=?2", rusqlite::params![completed as i32, id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn update_checklist_item(state: tauri::State<DbState>, input: UpdateItemInput) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("UPDATE checklist_items SET text=?1, priority=?2 WHERE id=?3",
        rusqlite::params![input.text, input.priority, input.id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_checklist_item(state: tauri::State<DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM checklist_items WHERE id=?1", [&id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn replace_checklist_items(state: tauri::State<DbState>, input: ReplaceItemsInput) -> Result<Vec<ChecklistItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM checklist_items WHERE checklist_id=?1", [&input.checklist_id])
        .map_err(|e| e.to_string())?;
    let mut items = Vec::new();
    for (pos, item) in input.items.iter().enumerate() {
        let item_id = new_id();
        conn.execute(
            "INSERT INTO checklist_items (id, checklist_id, text, completed, priority, position) VALUES (?1, ?2, ?3, 0, ?4, ?5)",
            rusqlite::params![item_id, input.checklist_id, item.text, item.priority, pos as i32],
        ).map_err(|e| e.to_string())?;
        items.push(ChecklistItem {
            id: item_id, checklist_id: input.checklist_id.clone(),
            text: item.text.clone(), completed: false,
            priority: item.priority.clone(), position: pos as i32,
        });
    }
    Ok(items)
}

#[tauri::command]
pub fn reorder_checklist_items(state: tauri::State<DbState>, ids: Vec<String>) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    for (pos, id) in ids.iter().enumerate() {
        conn.execute("UPDATE checklist_items SET position=?1 WHERE id=?2", rusqlite::params![pos as i32, id])
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}


#[tauri::command]
pub fn get_settings(state: tauri::State<DbState>) -> Result<serde_json::Value, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT key, value FROM settings").map_err(|e| e.to_string())?;
    let mut map = serde_json::Map::new();

    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    }).map_err(|e| e.to_string())?;

    for row in rows {
        let (k, v) = row.map_err(|e| e.to_string())?;
        let val: serde_json::Value = serde_json::from_str(&v).unwrap_or(serde_json::Value::String(v));
        map.insert(k, val);
    }

    Ok(serde_json::Value::Object(map))
}

#[tauri::command]
pub fn update_setting(state: tauri::State<DbState>, key: String, value: serde_json::Value) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let v = serde_json::to_string(&value).map_err(|e| e.to_string())?;
    conn.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?1, ?2)", rusqlite::params![key, v])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn reset_app_data(state: tauri::State<DbState>) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute_batch("DELETE FROM notes; DELETE FROM checklists;")
        .map_err(|e| e.to_string())?;
    Ok(())
}


#[tauri::command]
pub fn window_minimize(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn window_maximize(window: tauri::Window) -> Result<(), String> {
    if window.is_maximized().unwrap_or(false) {
        window.unmaximize().map_err(|e| e.to_string())
    } else {
        window.maximize().map_err(|e| e.to_string())
    }
}

#[tauri::command]
pub fn window_close(window: tauri::Window) -> Result<(), String> {
    window.close().map_err(|e| e.to_string())
}


#[tauri::command]
pub fn clear_reminder(state: tauri::State<DbState>, kind: String, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let n = now();
    match kind.as_str() {
        "note" => conn.execute(
            "UPDATE notes SET reminder=NULL, updated_at=?1 WHERE id=?2",
            rusqlite::params![n, id],
        ).map_err(|e| e.to_string())?,
        "checklist" => conn.execute(
            "UPDATE checklists SET reminder=NULL, updated_at=?1 WHERE id=?2",
            rusqlite::params![n, id],
        ).map_err(|e| e.to_string())?,
        _ => return Err(format!("unknown kind: {kind}")),
    };
    Ok(())
}

#[tauri::command]
pub fn set_close_to_tray(
    close_state: tauri::State<CloseToTray>,
    flag_arc: tauri::State<CloseFlagArc>,
    enabled: bool,
) {
    close_state.0.store(enabled, Ordering::Relaxed);
    flag_arc.0.store(enabled, Ordering::Relaxed);
}

#[tauri::command]
pub fn snooze_reminder(state: tauri::State<DbState>, kind: String, id: String, minutes: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let snooze_until = (chrono::Utc::now() + chrono::Duration::minutes(minutes)).to_rfc3339();
    let n = now();
    match kind.as_str() {
        "note" => conn.execute(
            "UPDATE notes SET reminder=?1, updated_at=?2 WHERE id=?3",
            rusqlite::params![snooze_until, n, id],
        ).map_err(|e| e.to_string())?,
        "checklist" => conn.execute(
            "UPDATE checklists SET reminder=?1, updated_at=?2 WHERE id=?3",
            rusqlite::params![snooze_until, n, id],
        ).map_err(|e| e.to_string())?,
        _ => return Err(format!("unknown kind: {kind}")),
    };
    Ok(())
}
