PRAGMA foreign_keys = ON;

-- Base categories table (per-user). Keep names unique per user.
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT,
  created_at INTEGER NOT NULL DEFAULT (CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Closure table for ancestors/descendants. We store user_id for fast filtering.
CREATE TABLE IF NOT EXISTS category_closure (
  user_id   TEXT NOT NULL,
  ancestor  TEXT NOT NULL,
  descendant TEXT NOT NULL,
  depth     INTEGER NOT NULL CHECK (depth >= 0), -- 0=self
  PRIMARY KEY (ancestor, descendant),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ancestor) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (descendant) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cc_ancestor   ON category_closure (user_id, ancestor, depth);
CREATE INDEX IF NOT EXISTS idx_cc_descendant ON category_closure (user_id, descendant);

-- FTS for category name search (per-user via row content join)
CREATE VIRTUAL TABLE IF NOT EXISTS categories_fts
USING fts5(name, content='categories', content_rowid='rowid');

CREATE TRIGGER IF NOT EXISTS categories_ai AFTER INSERT ON categories BEGIN
  INSERT INTO categories_fts(rowid, name) VALUES (new.rowid, new.name);
END;
CREATE TRIGGER IF NOT EXISTS categories_ad AFTER DELETE ON categories BEGIN
  DELETE FROM categories_fts WHERE rowid = old.rowid;
END;
CREATE TRIGGER IF NOT EXISTS categories_au AFTER UPDATE ON categories BEGIN
  UPDATE categories_fts SET name = new.name WHERE rowid = new.rowid;
END;


