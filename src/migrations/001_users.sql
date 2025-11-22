PRAGMA foreign_keys = ON;

-- Users (multiple profiles)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,              -- nanoid/uuid from app
  display_name TEXT NOT NULL,
  email TEXT,                       -- optional
  created_at INTEGER NOT NULL DEFAULT (CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)),
  deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);


