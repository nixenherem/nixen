CREATE TABLE IF NOT EXISTS completions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL,
  level_id INTEGER NOT NULL UNIQUE,
  attempts TEXT NOT NULL DEFAULT '',
  completed TEXT NOT NULL DEFAULT '',
  worst_fail TEXT NOT NULL DEFAULT '',
  video TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO completions (
  sort_order,
  level_id,
  image
)
VALUES (
  1,
  88136707,
  'sky-shredder.png'
);
