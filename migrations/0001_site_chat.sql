-- Agorà APS: chat nel sito. Messaggi conservati 30 giorni, cancellazione via cron Worker.
CREATE TABLE IF NOT EXISTS site_chats (
  id TEXT PRIMARY KEY,
  secret_hash TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed'))
);
CREATE INDEX IF NOT EXISTS idx_site_chats_expiry ON site_chats(updated_at);
CREATE TABLE IF NOT EXISTS site_chat_messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES site_chats(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('visitor','operator')),
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  notified INTEGER NOT NULL DEFAULT 0 CHECK (notified IN (0,1))
);
CREATE INDEX IF NOT EXISTS idx_site_chat_messages_chat_time ON site_chat_messages(chat_id,created_at);
