use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub pinned: bool,
    pub color: String,
    pub reminder: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateNoteInput {
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub color: String,
    pub reminder: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateNoteInput {
    pub id: String,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub pinned: bool,
    pub color: String,
    pub reminder: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChecklistItem {
    pub id: String,
    pub checklist_id: String,
    pub text: String,
    pub completed: bool,
    pub priority: String,
    pub position: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Checklist {
    pub id: String,
    pub title: String,
    pub category: String,
    pub tags: Vec<String>,
    pub scheduled_date: Option<String>,
    pub pinned: bool,
    pub reminder: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub items: Vec<ChecklistItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateChecklistInput {
    pub title: String,
    pub category: String,
    pub tags: Vec<String>,
    pub scheduled_date: Option<String>,
    pub reminder: Option<String>,
    pub items: Vec<NewChecklistItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewChecklistItem {
    pub text: String,
    pub priority: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateChecklistInput {
    pub id: String,
    pub title: String,
    pub category: String,
    pub tags: Vec<String>,
    pub scheduled_date: Option<String>,
    pub pinned: bool,
    pub reminder: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddItemInput {
    pub checklist_id: String,
    pub text: String,
    pub priority: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateItemInput {
    pub id: String,
    pub text: String,
    pub priority: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ReplaceItemsInput {
    pub checklist_id: String,
    pub items: Vec<NewChecklistItem>,
}
