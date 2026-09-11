# Supabase migrations

Versioned SQL for the Savvy production schema. There is **no Supabase CLI project** in this repo — apply files in the [SQL Editor](https://supabase.com/dashboard/project/_/sql).

Apply **in order**. Re-runs are safe (`IF NOT EXISTS` / `CREATE OR REPLACE` / `DROP POLICY IF EXISTS`).

## Phase C baseline

File: [`20260910_phase_c_supabase_baseline.sql`](./20260910_phase_c_supabase_baseline.sql)

Applies:

- Tables `categories`, `links`, `link_categories` if missing
- `links.metadata JSONB`
- `links.type` CHECK: `link | video | image | music | movie | other` (legacy `article` / `document` / `podcast` remapped)
- Indexes: `(user_id, created_at)`, `(user_id, is_read)`, GIN on `metadata`, plus join indexes
- Owner-only RLS on all three tables
- `link_categories` FKs with `ON DELETE CASCADE`

## Phase D — atomic joins + Storage

File: [`20260911_phase_d_atomic_joins_and_storage.sql`](./20260911_phase_d_atomic_joins_and_storage.sql)

Applies:

- RPC `save_link_with_categories(jsonb)` — insert/update a link and optionally replace `link_categories` in **one transaction** (`SECURITY INVOKER`, so table RLS still applies)
- Public Storage bucket `savvy-images`
- Storage policies: authenticated upload/update/delete only under `{auth.uid()}/…`; public read

If the Storage block fails (restricted SQL role), create the bucket in **Dashboard → Storage → New bucket → `savvy-images` (Public)** and re-run the policy statements. Details: [`SUPABASE_STORAGE_SETUP.md`](../SUPABASE_STORAGE_SETUP.md).

### Apply

1. Copy `.env.example` → `.env.local` and set `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
2. SQL Editor: run the Phase C file (if not already applied).
3. SQL Editor: run the Phase D file.
4. Confirm RPC: Database → Functions → `save_link_with_categories`.
5. Confirm bucket: Storage → `savvy-images` is **Public**, with the four policies enabled.

### What not to run instead

| Legacy file | Status |
| --- | --- |
| `SUPABASE_SETUP.md` (inline CREATE TABLE) | Docs only — use this folder |
| `DATABASE_SCHEMA.md` | Docs only — describes the same schema |
| `SUPABASE_FIX_ALL.sql` | Deprecated. Storage → Phase D migration / `SUPABASE_STORAGE_SETUP.md` |

## Later phases (not here)

- Realtime / offline queue / OAuth
- Phase E UI (categories grid, search pills, generic detail)
- Phase F auth branding

## Definition of done

**Phase C:** save a music/movie result → Table Editor `links.metadata` is non-null JSON, `type` in the allowed set.

**Phase D:** save a link with categories → `link_categories` matches in the same request (no orphan link if joins fail). Save an image → public URL on `links.url`. Device AsyncStorage is not the metadata source of truth.
