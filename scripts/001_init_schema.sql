-- Create tables for CloudVault (replacing Vercel Blob with Supabase)

-- 1. Shared notes table (for real-time text sync)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only keep one note record, so add unique constraint
ALTER TABLE notes ADD CONSTRAINT only_one_note CHECK (id = (SELECT id FROM notes LIMIT 1));

-- 2. Files table (for uploaded files)
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  bucket_name TEXT NOT NULL DEFAULT 'files',
  storage_path TEXT NOT NULL UNIQUE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_files_uploaded_at ON files(uploaded_at DESC);

-- 3. Images table (for pasted images)
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  bucket_name TEXT NOT NULL DEFAULT 'images',
  storage_path TEXT NOT NULL UNIQUE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_images_uploaded_at ON images(uploaded_at DESC);

-- Enable RLS (Row Level Security) - allow public read/write for demo
-- In production, you'd restrict this to authenticated users
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Allow public access (no auth required for demo)
CREATE POLICY "Allow public read" ON notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON notes FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON notes FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON files FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON files FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON files FOR DELETE USING (true);

CREATE POLICY "Allow public read" ON images FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON images FOR DELETE USING (true);

-- Insert initial empty note
INSERT INTO notes (content) VALUES ('') ON CONFLICT DO NOTHING;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('files', 'files', true),
  ('images', 'images', true)
ON CONFLICT DO NOTHING;

-- Allow public access to storage buckets
CREATE POLICY "Allow public read files" ON storage.objects FOR SELECT USING (bucket_id = 'files');
CREATE POLICY "Allow public upload files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'files');
CREATE POLICY "Allow public delete files" ON storage.objects FOR DELETE USING (bucket_id = 'files');

CREATE POLICY "Allow public read images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Allow public upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "Allow public delete images" ON storage.objects FOR DELETE USING (bucket_id = 'images');
