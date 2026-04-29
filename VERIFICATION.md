# CloudVault - Verification & Testing Guide

## Pre-Deployment Checklist

Before deploying to production, verify everything is working:

### 1. Environment Variables ✓

Check that Supabase integration is connected:
```bash
# These should be automatically set by Vercel/Supabase integration
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
echo $POSTGRES_URL
```

If any are missing:
1. Go to Vercel Project Settings → Integrations
2. Verify Supabase integration is connected
3. Re-connect if needed

### 2. Database Setup

Visit the initialization page to set up database:

```
http://localhost:3000/init  (local)
OR
https://yourdomain.com/init (production)
```

Steps:
1. Click "Initialize CloudVault"
2. Wait for all steps to complete
3. See green checkmarks for each step
4. Click "Go to CloudVault"

Expected Output:
```
✓ Database tables verified
✓ Storage buckets ready
✓ Shared note initialized
✅ CloudVault is ready!
```

### 3. Manual Verification (If Auto-Init Fails)

#### A. Check Database Tables

Go to Supabase Dashboard → SQL Editor:

```sql
-- Check notes table
SELECT * FROM notes LIMIT 1;

-- Check files table
SELECT * FROM files LIMIT 1;

-- Check images table
SELECT * FROM images LIMIT 1;
```

All queries should return (possibly empty result sets).

#### B. Create Tables (If They Don't Exist)

Go to Supabase Dashboard → SQL Editor → New Query:

```sql
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  content TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  size BIGINT NOT NULL,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS images (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  size BIGINT,
  content_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at DESC);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies
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

INSERT INTO notes (id, content) VALUES (1, '') ON CONFLICT DO NOTHING;
```

#### C. Create Storage Buckets

Go to Supabase Dashboard → Storage:

1. Click "New bucket"
   - Name: `files`
   - Visibility: **Public**
   - Click "Create bucket"

2. Click "New bucket"
   - Name: `images`
   - Visibility: **Public**
   - Click "Create bucket"

### 4. API Testing

Test each API endpoint:

#### Test Text Sync API

```bash
# Fetch note
curl -X GET "http://localhost:3000/api/note"

# Save note
curl -X POST "http://localhost:3000/api/note" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test text"}'

# Expected response:
# {"success": true, "updatedAt": "2024-xx-xxTxx:xx:xxZ"}
```

#### Test Files API

```bash
# List files
curl -X GET "http://localhost:3000/api/files"

# Expected response:
# {"files": []}  (empty at first)
```

#### Test Upload API

```bash
# Upload a file
curl -X POST "http://localhost:3000/api/upload" \
  -F "file=@test.txt"

# Expected response:
# {"id": 1, "pathname": "files/1234567890-test.txt", "filename": "test.txt", ...}
```

#### Test Images API

```bash
# List images
curl -X GET "http://localhost:3000/api/images"

# Expected response:
# {"images": []}  (empty at first)
```

### 5. Manual UI Testing

1. **Text Editor Test**
   - Open app in 2 browser tabs
   - Type in text editor in tab 1
   - Verify it appears in tab 2 within 2 seconds
   - Copy button should copy text to clipboard
   - Clear button should empty textarea

2. **Image Paste Test**
   - Open app
   - Copy an image to clipboard
   - Press Ctrl+V anywhere on page
   - Image should upload within 2-5 seconds
   - Verify it appears in Images section
   - Delete button should remove it

3. **File Upload Test**
   - Open app
   - Drag a file onto "Files" section
   - Should show uploading progress
   - Verify it appears in Files list
   - Click download, file should download
   - Delete button should remove it

4. **Cross-Device Sync Test**
   - Open app on 2 different devices (or browser tabs)
   - Upload a file on device 1
   - Check if it appears on device 2 within 2 seconds
   - Upload image on device 2
   - Check if it appears on device 1 within 2 seconds

### 6. Browser Console Check

Open browser console (F12) and verify:
- ✅ No red errors
- ✅ Network requests to `/api/*` should be 200/201
- ✅ No "Cannot read properties" errors
- ✅ Supabase client should be initialized

Look for these in console:
```javascript
// Good signs:
// API responses with status 200
// File uploads showing progress
// SWR revalidations happening

// Bad signs:
// 401/403 errors (auth issues)
// 500 errors (server issues)
// TypeError or ReferenceError
// "Cannot read properties of undefined"
```

### 7. Production Deployment Checklist

Before deploying to production:

- [ ] All database tables created
- [ ] Storage buckets created and set to public
- [ ] Environment variables configured in Vercel
- [ ] API endpoints tested locally
- [ ] UI components working
- [ ] No console errors
- [ ] Text sync working across tabs
- [ ] Image paste working
- [ ] File upload working
- [ ] File download working
- [ ] Delete functionality working
- [ ] PWA installable
- [ ] Mobile-responsive

### 8. Common Issues & Solutions

**Issue**: "Cannot read properties of undefined (reading 'map')"
- **Cause**: API returning undefined instead of array
- **Fix**: Ensure database tables exist. Visit `/init` page.

**Issue**: Images not uploading
- **Cause**: Storage bucket not created or not public
- **Fix**: Go to Supabase Dashboard → Storage and create public buckets

**Issue**: Text not syncing across devices
- **Cause**: SWR polling not working
- **Fix**: Check network tab, verify API returns data

**Issue**: "Missing Supabase environment variables"
- **Cause**: Env vars not set
- **Fix**: Check Vercel project settings, verify Supabase integration connected

**Issue**: 401/403 errors
- **Cause**: Auth token expired or invalid
- **Fix**: Refresh page, check SUPABASE_ANON_KEY is correct

**Issue**: Files not appearing in list
- **Cause**: Database not synced
- **Fix**: Click refresh button, check browser console

### 9. Performance Verification

Check that performance is acceptable:

```javascript
// Open browser console and run:

// Time API response
console.time('note-fetch');
fetch('/api/note').then(() => console.timeEnd('note-fetch'));

// Should complete in < 500ms

// Check SWR state
// Visit page and check Network tab
// Should see refreshing every 2 seconds
// But not on every keystroke (deduplication working)
```

### 10. Final Sign-Off

Once all above items are verified:

1. ✅ Deploy to Vercel
2. ✅ Test in production
3. ✅ Share URL with others
4. ✅ Monitor error logs
5. ✅ Celebrate! 🎉

## Debugging Tips

### Enable Debug Logging

In API routes, add debug logs:

```typescript
console.log('[v0] Starting operation...')
console.log('[v0] User input:', data)
console.log('[v0] API response:', response)
```

View logs in:
- **Local**: Browser console
- **Production**: Vercel Project → Logs

### Check Supabase Logs

In Supabase Dashboard:
- Go to Logs
- Filter by "Errors" or "Slow Queries"
- Look for issues with your tables/queries

### Network Debugging

1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform action (e.g., upload file)
4. Check request/response:
   - Status should be 200-201
   - Response body should be valid JSON
   - Headers should include proper Content-Type

### Browser Storage

Check data persistence:
```javascript
// View SWR cache
localStorage.getItem('swr-cache')

// Clear SWR cache
localStorage.removeItem('swr-cache')
```

## Support

If something doesn't work:

1. Check this verification guide
2. Look at console errors
3. Check Supabase logs
4. Check Vercel logs
5. Re-run `/init` page
6. Try clearing browser cache
7. Try incognito/private mode
8. Try different browser

Questions? Refer to SETUP.md and SYSTEM_SUMMARY.md
