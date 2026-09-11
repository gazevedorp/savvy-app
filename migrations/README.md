# Supabase migrations

Versioned SQL for the Savvy production schema. There is **no Supabase CLI project** in this repo — apply files in the [SQL Editor](https://supabase.com/dashboard/project/_/sql).

## Phase C baseline (current)

File: [`20260910_phase_c_supabase_baseline.sql`](./20260910_phase_c_supabase_baseline.sql)

Applies (idempotent):

- Tables `categories`, `links`, `link_categories` if missing
- `links.metadata JSONB`
- `links.type` CHECK: `link | video | image | music | movie | other` (legacy `article` / `document` / `podcast` remapped)
- Indexes: `(user_id, created_at)`, `(user_id, is_read)`, GIN on `metadata`, plus join indexes
- Owner-only RLS on all three tables
- `link_categories` FKs with `ON DELETE CASCADE`

### Apply

1. Copy `.env.example` → `.env.local` and set `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
2. Open the project SQL Editor, paste the Phase C file, run it once.
3. Re-running is safe (`IF NOT EXISTS` / `DROP POLICY IF EXISTS`).

### What not to run instead

| Legacy file | Status |
| --- | --- |
| `SUPABASE_SETUP.md` (inline CREATE TABLE) | Docs only — use this folder |
| `DATABASE_SCHEMA.md` | Docs only — describes the same schema |
| `SUPABASE_FIX_ALL.sql` | Deprecated for schema/RLS. Storage leftovers → `SUPABASE_STORAGE_SETUP.md` (Phase D) |

## Later phases (not here)

- Atomic `link_categories` rewrite
- Storage image uploads
- Removing AsyncStorage dual-write
- Realtime / offline queue / OAuth

## Definition of done (Phase C)

Happy path (documented; run against your project):

1. `cp .env.example .env.local` and set `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. Paste `20260910_phase_c_supabase_baseline.sql` in the SQL Editor and run
3. In the app, save a music or movie result
4. In Table Editor → `links`, confirm `type` is in the allowed set and `metadata` is non-null JSON

Schema is ready for Phase D (atomic `link_categories` rewrite, Storage uploads, drop AsyncStorage dual-write). Realtime, offline queue, OAuth, and UI redesign stay later.
