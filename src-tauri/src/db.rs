use rusqlite::{Connection, Result};

pub fn init(conn: &Connection) -> Result<()> {
    conn.execute_batch("
        PRAGMA journal_mode=WAL;
        PRAGMA foreign_keys=ON;

        CREATE TABLE IF NOT EXISTS notes (
            id          TEXT PRIMARY KEY,
            title       TEXT NOT NULL,
            content     TEXT NOT NULL DEFAULT '',
            tags        TEXT NOT NULL DEFAULT '[]',
            pinned      INTEGER NOT NULL DEFAULT 0,
            color       TEXT NOT NULL DEFAULT '',
            reminder    TEXT,
            created_at  TEXT NOT NULL,
            updated_at  TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS checklists (
            id             TEXT PRIMARY KEY,
            title          TEXT NOT NULL,
            category       TEXT NOT NULL DEFAULT '',
            tags           TEXT NOT NULL DEFAULT '[]',
            scheduled_date TEXT,
            pinned         INTEGER NOT NULL DEFAULT 0,
            reminder       TEXT,
            created_at     TEXT NOT NULL,
            updated_at     TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS checklist_items (
            id           TEXT PRIMARY KEY,
            checklist_id TEXT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
            text         TEXT NOT NULL,
            completed    INTEGER NOT NULL DEFAULT 0,
            priority     TEXT NOT NULL DEFAULT 'medium',
            position     INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        INSERT OR IGNORE INTO settings (key, value) VALUES
            ('theme', '\"dark\"'),
            ('accent_color', '\"#06b6d4\"'),
            ('border_radius', '\"medium\"'),
            ('font_size', '\"medium\"'),
            ('show_completed', 'true'),
            ('enable_reminders', 'true'),
            ('close_to_tray', 'false'),
            ('default_view', '\"dashboard\"');
    ")?;
    Ok(())
}
