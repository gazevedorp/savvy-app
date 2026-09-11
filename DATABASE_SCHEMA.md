# Schemas das Tabelas do Supabase

**Apply path (Phase C):** run [`migrations/20260910_phase_c_supabase_baseline.sql`](./migrations/20260910_phase_c_supabase_baseline.sql) in the SQL Editor. That file is the single source of truth for tables, `links.metadata`, indexes, type CHECK, FKs, and RLS. This document describes the resulting schema.

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

After Phase C, the JSONB column is the primary path. AsyncStorage (`utils/mediaCache.ts`) only gap-fills rows that still lack the column (pre-migration DBs). Removing that dual-write is Phase D.

### Legacy `type` values

The migration remaps before adding the CHECK:

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

Atomic rewrite of this join table is Phase D — not in the baseline.

## 4. Storage

Image bucket + storage RLS are **not** part of Phase C. See [`SUPABASE_STORAGE_SETUP.md`](./SUPABASE_STORAGE_SETUP.md).
