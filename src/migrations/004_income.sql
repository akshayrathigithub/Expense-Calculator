PRAGMA foreign_keys = ON;

-- Income entries (per user)
CREATE TABLE IF NOT EXISTS income_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  occurred_at INTEGER NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL DEFAULT (CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)),
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inc_user_date   ON income_entries (user_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_inc_user_amount ON income_entries (user_id, amount_cents);
CREATE INDEX IF NOT EXISTS idx_inc_user_alive  ON income_entries (user_id) WHERE deleted = 0;

CREATE TABLE IF NOT EXISTS income_categories (
  income_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (income_id, category_id),
  FOREIGN KEY (income_id) REFERENCES income_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inc_cat_income ON income_categories (income_id);
CREATE INDEX IF NOT EXISTS idx_inc_cat_category ON income_categories (category_id);