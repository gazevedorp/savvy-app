# Schemas das Tabelas do Supabase

**Apply path:** run Phase C then Phase D in [`migrations/`](./migrations/README.md). This document describes the resulting schema.

See [`migrations/README.md`](./migrations/README.md) for how to apply and what not to run instead.

## 1. `categories`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID | `gen_random_uuid()`, PK |
| `name` | TEXT | required |
| `color` | TEXT | hex |
| `icon` | TEXT | optional |
| `user_id` | UUID | `auth.users(id)` ON DELETE CASCADE |
| `created_at` | TIMESTAMPTZ | default `NOW()` |

RLS: owner-only SELECT / INSERT / UPDATE / DELETE (`auth.uid() = user_id`).

Index: `(user_id, created_at DESC)`.

## 2. `links`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID | `gen_random_uuid()`, PK |
| `url` | TEXT | required |
| `title` | TEXT | required |
| `description` | TEXT | optional |
| `thumbnail` | TEXT | optional |
| `type` | TEXT | CHECK: `link \| video \| image \| music \| movie \| other` (same as `LINK_TYPES` in `types/index.ts`) |
| `metadata` | JSONB | optional media payload (music/movie) |
| `user_id` | UUID | `auth.users(id)` ON DELETE CASCADE |
| `is_read` | BOOLEAN | default `false` |
| `read_at` | TIMESTAMPTZ | optional |
| `progress` | INTEGER | 0–100, default `0` |
| `created_at` | TIMESTAMPTZ | default `NOW()` |

RLS: owner-only SELECT / INSERT / UPDATE / DELETE.

Indexes:

- `(user_id, created_at DESC)` — Home list
- `(user_id, is_read)` — unread filters
- GIN `(metadata)` — optional JSONB lookups

### `metadata` shape (app)

Written and read by `store/linkStore.ts`. Matches `MediaMetadata` in `types/index.ts`:

```ts
{
  source: 'itunes' | 'deezer' | 'tmdb' | 'wikipedia',
  sourceId: string,
  artistName?: string,
  collectionName?: string,
  releaseDate?: string,
  releaseYear?: string,
  genres?: string[],
  artworkUrl?: string,
  previewUrl?: string,
  durationMs?: number,
  contentAdvisory?: string,
  kind?: string
}
```

After Phase D, `links.metadata` JSONB is the only source of truth. A one-shot import copies leftover AsyncStorage cache into Postgres on the next fetch, then **deletes the device cache** (failed updates and orphan keys are dropped). Dual-write is gone.

Atomic writes go through RPC `save_link_with_categories` (see Phase D migration): the link row and optional `link_categories` rewrite commit together. Toggle-read omits `category_ids` so joins are left alone.

### Legacy `type` values

The Phase C migration remaps before adding the CHECK:

| Old (docs / early drafts) | New |
| --- | --- |
| `article`, `document` | `link` |
| `podcast` | `music` |
| anything else unknown | `other` |

## 3. `link_categories`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | UUID | `gen_random_uuid()`, PK |
| `link_id` | UUID | → `links(id)` ON DELETE CASCADE |
| `category_id` | UUID | → `categories(id)` ON DELETE CASCADE |
| `user_id` | UUID | → `auth.users(id)` ON DELETE CASCADE |
| `created_at` | TIMESTAMPTZ | default `NOW()` |

Unique `(link_id, category_id)`. RLS: owner-only (including UPDATE). Indexes on `user_id`, `link_id`, `category_id`.

`ON DELETE CASCADE` from both `links` and `categories` — deleting a link or category removes join rows. Deleting a category does **not** delete the links themselves (the app offers that as a separate confirm).

Writes: `public.save_link_with_categories(p_payload jsonb)` replaces joins when the payload includes `category_ids` (empty array clears). GRANT: `authenticated` only.

## 4. Storage

Image files live in the public bucket `savvy-images` (`{user_id}/{timestamp}-{rand}.ext`). The app stores the **public URL** on `links.url` (and `thumbnail`). Apply [`migrations/20260911_phase_d_atomic_joins_and_storage.sql`](./migrations/20260911_phase_d_atomic_joins_and_storage.sql). Dashboard fallback: [`SUPABASE_STORAGE_SETUP.md`](./SUPABASE_STORAGE_SETUP.md).
