PRAGMA foreign_keys = ON;

-- App-level metadata singleton. Extend with more columns over time.
CREATE TABLE IF NOT EXISTS meta (
  id                 INTEGER PRIMARY KEY CHECK (id = 1),
  selected_user_id   TEXT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (selected_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Ensure the singleton row exists.
INSERT OR IGNORE INTO meta (id, selected_user_id) VALUES (1, NULL);


