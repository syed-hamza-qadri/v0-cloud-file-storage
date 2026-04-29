-- CloudVault Database Schema (Supabase PostgreSQL)

-- 1. Notes table - shared text that syncs across all devices
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  content TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Files table - metadata for uploaded files
CREATE TABLE IF NOT EXISTS files (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  size BIGINT NOT NULL,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Images table - metadata for pasted images
CREATE TABLE IF NOT EXISTS images (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  size BIGINT,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Policies for notes table
CREATE POLICY notes_select ON notes FOR SELECT USING (true);
CREATE POLICY notes_insert ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY notes_update ON notes FOR UPDATE USING (true);
CREATE POLICY notes_delete ON notes FOR DELETE USING (true);

-- Policies for files table
CREATE POLICY files_select ON files FOR SELECT USING (true);
CREATE POLICY files_insert ON files FOR INSERT WITH CHECK (true);
CREATE POLICY files_delete ON files FOR DELETE USING (true);

-- Policies for images table
CREATE POLICY images_select ON images FOR SELECT USING (true);
CREATE POLICY images_insert ON images FOR INSERT WITH CHECK (true);
CREATE POLICY images_delete ON images FOR DELETE USING (true);

-- Insert initial note record
INSERT INTO notes (id, content) VALUES (1, '') ON CONFLICT DO NOTHING;
