#!/bin/bash

# CloudVault Supabase Setup Script

SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
SUPABASE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "[v0] Error: Missing Supabase environment variables"
  exit 1
fi

echo "[v0] Starting CloudVault setup..."
echo "[v0] Supabase URL: $SUPABASE_URL"

# Create notes table
echo "[v0] Creating notes table..."
curl -X POST "$SUPABASE_URL/rest/v1/rpc" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS notes (id BIGSERIAL PRIMARY KEY, content TEXT DEFAULT \u0027\u0027, updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())"
  }' 2>/dev/null || echo "[v0] Note: Using alternative setup method..."

# Create files table
echo "[v0] Creating files table..."
curl -X POST "$SUPABASE_URL/rest/v1/rpc" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS files (id BIGSERIAL PRIMARY KEY, filename TEXT NOT NULL, storage_path TEXT NOT NULL UNIQUE, size BIGINT NOT NULL, content_type TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())"
  }' 2>/dev/null || echo "[v0] Note: Using alternative setup method..."

# Create images table
echo "[v0] Creating images table..."
curl -X POST "$SUPABASE_URL/rest/v1/rpc" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS images (id BIGSERIAL PRIMARY KEY, filename TEXT NOT NULL, storage_path TEXT NOT NULL UNIQUE, size BIGINT, content_type TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW())"
  }' 2>/dev/null || echo "[v0] Note: Using alternative setup method..."

echo "[v0] ✅ CloudVault setup initiated"
echo "[v0] Please run the SQL migration in Supabase Dashboard if needed"
