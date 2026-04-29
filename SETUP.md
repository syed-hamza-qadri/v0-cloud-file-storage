# CloudVault - Complete Setup Guide

## Overview

CloudVault is a fast, real-time cloud storage platform that syncs files, images, and text across all connected devices instantly. It uses Supabase for unlimited free storage and real-time capabilities.

## System Architecture

### Three Main Components

1. **Text Editor** - Real-time shared notes
   - Syncs changes instantly across all devices
   - Auto-saves every 300ms
   - Copy, clear, and refresh buttons

2. **Image Paste Zone** - Smart image uploads
   - Paste images directly with Ctrl+V
   - Instant upload to Supabase Storage
   - Real-time display on all devices
   - Delete with hover button

3. **File Upload Zone** - All file types
   - Drag-and-drop support
   - Ctrl+V paste non-image files
   - 6 concurrent uploads for speed
   - Real-time sync across devices

## Quick Start

### Option 1: Automatic Setup (Recommended)

1. **Visit the initialization page**: `http://yourapp.com/init`
2. **Click "Initialize CloudVault"**
3. **Wait for completion**
4. **Click "Go to CloudVault"**

The initialization will:
- Create database tables (notes, files, images)
- Set up storage buckets (files, images)
- Initialize shared note record
- Configure Row Level Security (RLS)

### Option 2: Manual Setup via Supabase Dashboard

#### Step 1: Create Database Tables

Go to Supabase Dashboard → SQL Editor → New Query and run:

```sql
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

-- Policies
CREATE POLICY notes_select ON notes FOR SELECT USING (true);
CREATE POLICY notes_insert ON notes FOR INSERT WITH CHECK (true);
CREATE POLICY notes_update ON notes FOR UPDATE USING (true);
CREATE POLICY notes_delete ON notes FOR DELETE USING (true);

CREATE POLICY files_select ON files FOR SELECT USING (true);
CREATE POLICY files_insert ON files FOR INSERT WITH CHECK (true);
CREATE POLICY files_delete ON files FOR DELETE USING (true);

CREATE POLICY images_select ON images FOR SELECT USING (true);
CREATE POLICY images_insert ON images FOR INSERT WITH CHECK (true);
CREATE POLICY images_delete ON images FOR DELETE USING (true);

-- Insert initial note record
INSERT INTO notes (id, content) VALUES (1, '') ON CONFLICT DO NOTHING;
```

#### Step 2: Create Storage Buckets

Go to Supabase Dashboard → Storage and create:

1. **Bucket Name**: `files`
   - Visibility: **Public**
   - File size limit: Leave default

2. **Bucket Name**: `images`
   - Visibility: **Public**
   - File size limit: Leave default

## API Endpoints

### Text Sync
- `GET /api/note` - Fetch current shared text
- `POST /api/note` - Save text (auto-saves every 300ms)
- `DELETE /api/note` - Clear text

### Files
- `GET /api/files` - List all uploaded files
- `POST /api/upload` - Upload a file
- `DELETE /api/delete` - Delete a file
- `GET /api/file` - Download/stream a file

### Images
- `GET /api/images` - List all pasted images
- `POST /api/images` - Upload an image
- `DELETE /api/images` - Delete an image

### Initialization
- `POST /api/init` - Create database tables
- `POST /api/init/buckets` - Create storage buckets

## Features

### Real-Time Syncing
- Changes appear on all connected devices within 500ms
- Uses SWR with 2-second polling
- Optimistic UI updates for instant feedback

### Smart Paste (Ctrl+V)
- **Images**: Automatically paste and upload
- **Files**: Automatically upload to files section
- **Text**: Appears in text editor

### Performance
- Edge runtime on all APIs
- 6 concurrent uploads max
- Gzip compression
- Browser caching
- Optimistic updates

### Storage
- Unlimited free tier (Supabase)
- Support for all file types
- Fast downloads with streaming
- No suspension issues

## Environment Variables

Required (automatically set by Supabase integration):
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
POSTGRES_URL
```

## Troubleshooting

### Database Tables Not Created
1. Visit `http://yourapp.com/init`
2. Click "Initialize CloudVault"
3. Check Supabase Dashboard SQL Editor for errors

### Images Not Uploading
- Check if `images` bucket exists in Supabase Storage
- Ensure bucket is set to **Public** visibility

### Files Not Syncing
- Check browser console for errors
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Clear browser cache and refresh

### Slow Performance
- Check network tab in browser DevTools
- Verify Supabase region is closest to your location
- Check for rate limiting (429 errors)

## Database Schema

### notes table
```sql
id: BIGSERIAL PRIMARY KEY
content: TEXT (shared note content)
updated_at: TIMESTAMP WITH TIME ZONE (last update)
```

### files table
```sql
id: BIGSERIAL PRIMARY KEY
filename: TEXT (original file name)
storage_path: TEXT (path in storage)
size: BIGINT (file size in bytes)
content_type: TEXT (MIME type)
created_at: TIMESTAMP WITH TIME ZONE (upload time)
```

### images table
```sql
id: BIGSERIAL PRIMARY KEY
filename: TEXT (image file name)
storage_path: TEXT (path in storage)
size: BIGINT (file size in bytes)
content_type: TEXT (MIME type)
created_at: TIMESTAMP WITH TIME ZONE (upload time)
```

## Storage Buckets

### files bucket
- Stores all uploaded files (any type)
- Public access for fast downloads
- Path: `/files/{timestamp-filename}`

### images bucket
- Stores pasted images
- Public access
- Path: `/images/{timestamp}.{ext}`

## Next Steps

1. ✅ Deploy to Vercel (git push)
2. ✅ Visit initialization page (`/init`)
3. ✅ Create tables and buckets
4. ✅ Share the app link with others
5. ✅ Start uploading and syncing!

## Support

For issues or questions:
- Check the Supabase logs: Supabase Dashboard → Logs
- Check browser console for errors
- Verify environment variables are set

## Features Roadmap

- [ ] User authentication
- [ ] File sharing with permissions
- [ ] Search functionality
- [ ] File versioning
- [ ] Offline support
- [ ] Encryption at rest
