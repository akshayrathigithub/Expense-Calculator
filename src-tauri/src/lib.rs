// src-tauri/src/main.rs
use tauri::{generate_context, Builder};
use tauri_plugin_sql::{Builder as SqlBuilder, Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        // other plugins
        .plugin(tauri_plugin_opener::init())
        // register sql plugin and add migrations for a sqlite file named "expenses.db"
        .plugin(
            SqlBuilder::default()
                .add_migrations(
                    "sqlite:expenses.db",
                    vec![
                        Migration {
                            version: 1,
                            description: "users table",
                            sql: include_str!("../../src/migrations/001_users.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 2,
                            description: "categories + closure + fts",
                            sql: include_str!("../../src/migrations/002_categories.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 3,
                            description: "expense_entries",
                            sql: include_str!("../../src/migrations/003_expenses.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 4,
                            description: "income_entries",
                            sql: include_str!("../../src/migrations/004_income.sql"),
                            kind: MigrationKind::Up,
                        },
                        Migration {
                            version: 5,
                            description: "meta_data",
                            sql: include_str!("../../src/migrations/005_meta.sql"),
                            kind: MigrationKind::Up,
                        },
                    ],
                )
                .build(),
        )
        .run(generate_context!())
        .expect("error while running tauri application");
}
