use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2, Params, Algorithm, Version,
};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::sync::Mutex;
use tauri::{Manager, State};
use tauri_plugin_sql::{Migration, MigrationKind};

const DB_FILENAME: &str = "omnia.db";

// ─── Session ──────────────────────────────────────────────────────────────────
#[derive(Default)]
struct SessionState(Mutex<Option<SessionData>>);

#[derive(Clone, Serialize, Deserialize)]
struct SessionData {
    user_id: String,
    username: String,
    email: String,
    token: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UserProfile {
    pub id: String,
    pub username: String,
    pub email: String,
}

#[derive(Serialize, Deserialize)]
pub struct AuthResult {
    pub user: UserProfile,
    pub token: String,
}

struct AppDb(SqlitePool);

// ─── Migrations ───────────────────────────────────────────────────────────────
fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "initial_schema",
            sql: include_str!("../migrations/001_initial_schema.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "auth_and_themes",
            sql: include_str!("../migrations/002_auth_and_themes.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "note_folders",
            sql: include_str!("../migrations/003_note_folders.sql"),
            kind: MigrationKind::Up,
        },
    ]
}

// ─── Password helpers ─────────────────────────────────────────────────────────
fn argon2_instance() -> Argon2<'static> {
    // OWASP recommended Argon2id params: m=19456 (19 MiB), t=2, p=1
    let params = Params::new(19_456, 2, 1, None)
        .expect("valid argon2 params");
    Argon2::new(Algorithm::Argon2id, Version::V0x13, params)
}

fn hash_password(password: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    argon2_instance()
        .hash_password(password.as_bytes(), &salt)
        .map(|h| h.to_string())
        .map_err(|e| e.to_string())
}

fn verify_password(password: &str, hash: &str) -> bool {
    let Ok(parsed) = PasswordHash::new(hash) else { return false; };
    argon2_instance()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok()
}

fn new_token() -> String { uuid::Uuid::new_v4().to_string() }

fn require_session(session: &State<SessionState>) -> Result<String, String> {
    session.0.lock().unwrap()
        .as_ref()
        .map(|s| s.user_id.clone())
        .ok_or_else(|| "Not authenticated.".to_string())
}

// ─── Auth commands ────────────────────────────────────────────────────────────
#[tauri::command]
async fn register(
    db: State<'_, AppDb>,
    session: State<'_, SessionState>,
    username: String,
    email: String,
    password: String,
) -> Result<AuthResult, String> {
    let email = email.trim().to_lowercase();
    let username = username.trim().to_string();
    if username.is_empty() { return Err("Username is required.".into()); }
    if email.is_empty()    { return Err("Email is required.".into()); }
    if password.len() < 8  { return Err("Password must be at least 8 characters.".into()); }

    let existing: Option<(String,)> = sqlx::query_as("SELECT id FROM users WHERE email = ?")
        .bind(&email).fetch_optional(&db.0).await.map_err(|e| e.to_string())?;
    if existing.is_some() { return Err("An account with this email already exists.".into()); }

    let id = uuid::Uuid::new_v4().to_string();
    let hash = hash_password(&password)?;

    sqlx::query("INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?)")
        .bind(&id).bind(&email).bind(&username).bind(&hash)
        .execute(&db.0).await.map_err(|e| e.to_string())?;

    sqlx::query("INSERT OR IGNORE INTO user_preferences (user_id, theme_id) VALUES (?, 'dark')")
        .bind(&id).execute(&db.0).await.map_err(|e| e.to_string())?;

    let token = new_token();
    *session.0.lock().unwrap() = Some(SessionData {
        user_id: id.clone(), username: username.clone(), email: email.clone(), token: token.clone(),
    });
    Ok(AuthResult { user: UserProfile { id, username, email }, token })
}

#[tauri::command]
async fn login(
    db: State<'_, AppDb>,
    session: State<'_, SessionState>,
    email: String,
    password: String,
) -> Result<AuthResult, String> {
    let email = email.trim().to_lowercase();
    let row: Option<(String, String, String)> =
        sqlx::query_as("SELECT id, username, password_hash FROM users WHERE email = ?")
            .bind(&email).fetch_optional(&db.0).await.map_err(|e| e.to_string())?;
    let (id, username, stored_hash) =
        row.ok_or_else(|| "Invalid email or password.".to_string())?;
    if !verify_password(&password, &stored_hash) {
        return Err("Invalid email or password.".to_string());
    }
    let token = new_token();
    *session.0.lock().unwrap() = Some(SessionData {
        user_id: id.clone(), username: username.clone(), email: email.clone(), token: token.clone(),
    });
    Ok(AuthResult { user: UserProfile { id, username, email }, token })
}

#[tauri::command]
fn logout(session: State<'_, SessionState>) -> Result<(), String> {
    *session.0.lock().unwrap() = None;
    Ok(())
}

#[tauri::command]
fn get_current_user(session: State<'_, SessionState>) -> Option<UserProfile> {
    session.0.lock().unwrap().as_ref().map(|s| UserProfile {
        id: s.user_id.clone(), username: s.username.clone(), email: s.email.clone(),
    })
}

#[tauri::command]
async fn update_profile(
    db: State<'_, AppDb>,
    session: State<'_, SessionState>,
    username: String,
) -> Result<UserProfile, String> {
    let user_id = require_session(&session)?;
    let username = username.trim().to_string();
    if username.is_empty() { return Err("Username cannot be empty.".into()); }
    sqlx::query("UPDATE users SET username = ? WHERE id = ?")
        .bind(&username).bind(&user_id).execute(&db.0).await.map_err(|e| e.to_string())?;
    let email = session.0.lock().unwrap().as_ref().map(|s| s.email.clone()).unwrap_or_default();
    { let mut lock = session.0.lock().unwrap(); if let Some(ref mut s) = *lock { s.username = username.clone(); } }
    Ok(UserProfile { id: user_id, username, email })
}

#[tauri::command]
async fn change_password(
    db: State<'_, AppDb>,
    session: State<'_, SessionState>,
    current_password: String,
    new_password: String,
) -> Result<(), String> {
    if new_password.len() < 8 { return Err("New password must be at least 8 characters.".into()); }
    let user_id = require_session(&session)?;
    let (stored_hash,): (String,) = sqlx::query_as("SELECT password_hash FROM users WHERE id = ?")
        .bind(&user_id).fetch_one(&db.0).await.map_err(|e| e.to_string())?;
    if !verify_password(&current_password, &stored_hash) { return Err("Current password is incorrect.".into()); }
    let new_hash = hash_password(&new_password)?;
    sqlx::query("UPDATE users SET password_hash = ? WHERE id = ?")
        .bind(&new_hash).bind(&user_id).execute(&db.0).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn save_theme_preference(
    db: State<'_, AppDb>,
    session: State<'_, SessionState>,
    theme_id: String,
) -> Result<(), String> {
    let user_id = require_session(&session)?;
    sqlx::query(
        "INSERT INTO user_preferences (user_id, theme_id) VALUES (?, ?) ON CONFLICT(user_id) DO UPDATE SET theme_id = ?, updated_at = CURRENT_TIMESTAMP",
    )
    .bind(&user_id).bind(&theme_id).bind(&theme_id)
    .execute(&db.0).await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn load_theme_preference(
    db: State<'_, AppDb>,
    session: State<'_, SessionState>,
) -> Result<String, String> {
    let user_id = require_session(&session)?;
    let row: Option<(String,)> =
        sqlx::query_as("SELECT theme_id FROM user_preferences WHERE user_id = ?")
            .bind(&user_id).fetch_optional(&db.0).await.map_err(|e| e.to_string())?;
    Ok(row.map(|(t,)| t).unwrap_or_else(|| "dark".into()))
}

#[tauri::command]
async fn close_splashscreen(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(splash) = app.get_webview_window("splashscreen") {
        splash.close().map_err(|e| e.to_string())?;
    }
    if let Some(main) = app.get_webview_window("main") {
        main.show().map_err(|e| e.to_string())?;
        main.maximize().map_err(|e| e.to_string())?;
        main.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

// ─── Entry point ──────────────────────────────────────────────────────────────
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SessionState::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:omnia.db", migrations())
                .build(),
        )
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()
                .expect("could not resolve app data dir");
            std::fs::create_dir_all(&app_data_dir).ok();
            let db_url = format!("sqlite://{}/{}", app_data_dir.display(), DB_FILENAME);

            let pool = tauri::async_runtime::block_on(async {
                sqlx::sqlite::SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect(&db_url)
                    .await
                    .expect("failed to connect sqlite for auth")
            });
            app.manage(AppDb(pool));

            // Failsafe: force main window after 8 s if splash never closes
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                tokio::time::sleep(std::time::Duration::from_secs(8)).await;
                if let Some(main) = handle.get_webview_window("main") {
                    if !main.is_visible().unwrap_or(true) {
                        let _ = main.show();
                        let _ = main.maximize();
                    }
                }
                if let Some(splash) = handle.get_webview_window("splashscreen") {
                    let _ = splash.close();
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            register,
            login,
            logout,
            get_current_user,
            update_profile,
            change_password,
            save_theme_preference,
            load_theme_preference,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
