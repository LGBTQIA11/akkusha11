CREATE TABLE IF NOT EXISTS works (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    like_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_likes (
    work_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (work_id, user_id),
    FOREIGN KEY (work_id) REFERENCES works(id)
);
