CREATE TABLE IF NOT EXISTS poles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  badge TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  linkedin TEXT,
  pole_id TEXT NOT NULL REFERENCES poles(id),
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  partner TEXT NOT NULL,
  partner_description TEXT,
  pole TEXT,
  description TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL CHECK(status IN ('upcoming', 'past')),
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS event_highlights (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS event_photos (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
