-- No raw form data, email addresses or IP addresses are stored.
CREATE TABLE IF NOT EXISTS contact_requests (
  request_id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  state TEXT NOT NULL DEFAULT 'processing',
  response_status INTEGER,
  response_json TEXT
);
CREATE INDEX IF NOT EXISTS contact_requests_created ON contact_requests(created_at);
CREATE TABLE IF NOT EXISTS contact_rate_limits (
  bucket TEXT PRIMARY KEY,
  hits INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  subscriber_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  rubro TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK(status IN ('pending','subscribed','unsubscribed')),
  consent_version TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  confirmed_at INTEGER,
  updated_at INTEGER NOT NULL,
  confirmation_hash TEXT UNIQUE,
  confirmation_expires INTEGER,
  unsubscribe_hash TEXT UNIQUE,
  unsubscribe_previous_hash TEXT,
  welcome_state TEXT NOT NULL DEFAULT 'pending',
  welcome_attempts INTEGER NOT NULL DEFAULT 0,
  welcome_sent_at INTEGER
);
CREATE INDEX IF NOT EXISTS newsletter_status ON newsletter_subscribers(status,updated_at);
