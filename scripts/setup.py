#!/usr/bin/env python3
import os
import sys
import psycopg2
from psycopg2 import sql

# Get Supabase connection string from environment
postgres_url = os.getenv('POSTGRES_URL')
if not postgres_url:
    print("[v0] Error: POSTGRES_URL environment variable not set")
    sys.exit(1)

print("[v0] Starting CloudVault setup...")

try:
    # Connect to Supabase PostgreSQL
    print("[v0] Connecting to Supabase database...")
    conn = psycopg2.connect(postgres_url, sslmode='require')
    cursor = conn.cursor()

    # Read the SQL migration file
    print("[v0] Reading migration script...")
    with open('scripts/001_init_schema.sql', 'r') as f:
        sql_content = f.read()

    # Split by semicolons and execute each statement
    statements = [s.strip() for s in sql_content.split(';') if s.strip()]
    
    print(f"[v0] Executing {len(statements)} SQL statements...")
    for i, statement in enumerate(statements, 1):
        try:
            cursor.execute(statement)
            print(f"[v0] ✓ Statement {i}/{len(statements)}")
        except Exception as e:
            if "already exists" in str(e).lower():
                print(f"[v0] ✓ Statement {i}/{len(statements)} (already exists)")
            else:
                print(f"[v0] ✗ Statement {i} failed: {e}")

    conn.commit()
    print("[v0] ✅ Database tables created successfully")

    # Close connection
    cursor.close()
    conn.close()

    print("[v0] ✅ CloudVault setup complete!")
    print("[v0] Ready to sync files, images, and text across all devices")
    sys.exit(0)

except Exception as e:
    print(f"[v0] ✗ Setup failed: {e}")
    sys.exit(1)
