PRAGMA foreign_keys = ON;

-- Expense entries (per user)
CREATE TABLE IF NOT EXISTS expense_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,      -- store in minor units
  currency TEXT NOT NULL DEFAULT 'INR',
  occurred_at INTEGER NOT NULL,       -- unix epoch seconds
  note TEXT,
  created_at INTEGER NOT NULL DEFAULT (CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST((julianday('now') - 2440587.5) * 86400000 AS INTEGER)),
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sorting and grouping friendly indexes
CREATE INDEX IF NOT EXISTS idx_exp_user_date   ON expense_entries (user_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_exp_user_amount ON expense_entries (user_id, amount_cents);
CREATE INDEX IF NOT EXISTS idx_exp_user_alive  ON expense_entries (user_id) WHERE deleted = FALSE;

-- Many-to-many join between expenses and categories.
CREATE TABLE IF NOT EXISTS expense_categories (
  expense_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (expense_id, category_id),
  FOREIGN KEY (expense_id) REFERENCES expense_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_exp_cat_expense ON expense_categories (expense_id);
CREATE INDEX IF NOT EXISTS idx_exp_cat_category ON expense_categories (category_id);


