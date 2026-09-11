-- =============================================================================
-- Savvy Phase C — Supabase production baseline
-- =============================================================================
-- Single source of truth for schema + RLS. Idempotent: safe on existing
-- production databases and on a brand-new project.
--
-- How to apply
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Paste this entire file and Run
--   3. Confirm no errors (CREATE IF NOT EXISTS / DROP IF EXISTS throughout)
--
-- Out of scope (Phase D+): Storage buckets, atomic link_categories rewrite,
-- Realtime, OAuth. See SUPABASE_STORAGE_SETUP.md for image uploads.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Tables (bootstrap for new projects)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.link_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (link_id, category_id)
);

-- Existing DBs created before Phase C may lack this column
ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

COMMENT ON COLUMN public.links.metadata IS
  'Optional media payload (music/movie): source, artwork, artist, genres, preview, etc.';

COMMENT ON COLUMN public.links.type IS
  'App LinkType: link | video | image | music | movie | other';

-- -----------------------------------------------------------------------------
-- Type values align with the app (types/index.ts LINK_TYPES)
-- Legacy docs used article | podcast | document — remap before the CHECK.
-- -----------------------------------------------------------------------------

UPDATE public.links SET type = 'link' WHERE type IN ('article', 'document');
UPDATE public.links SET type = 'music' WHERE type = 'podcast';
UPDATE public.links
  SET type = 'other'
  WHERE type IS NULL
     OR type NOT IN ('link', 'video', 'image', 'music', 'movie', 'other');

ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_type_check;
ALTER TABLE public.links
  ADD CONSTRAINT links_type_check
  CHECK (type IN ('link', 'video', 'image', 'music', 'movie', 'other'));

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS links_user_id_created_at_idx
  ON public.links (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS links_user_id_is_read_idx
  ON public.links (user_id, is_read);

-- Optional: JSONB containment / key lookups on media metadata
CREATE INDEX IF NOT EXISTS links_metadata_gin_idx
  ON public.links USING GIN (metadata);

CREATE INDEX IF NOT EXISTS categories_user_id_created_at_idx
  ON public.categories (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS link_categories_user_id_idx
  ON public.link_categories (user_id);

CREATE INDEX IF NOT EXISTS link_categories_link_id_idx
  ON public.link_categories (link_id);

CREATE INDEX IF NOT EXISTS link_categories_category_id_idx
  ON public.link_categories (category_id);

-- -----------------------------------------------------------------------------
-- Foreign keys: ON DELETE CASCADE (align older projects)
-- -----------------------------------------------------------------------------

ALTER TABLE public.link_categories DROP CONSTRAINT IF EXISTS link_categories_link_id_fkey;
ALTER TABLE public.link_categories
  ADD CONSTRAINT link_categories_link_id_fkey
  FOREIGN KEY (link_id) REFERENCES public.links(id) ON DELETE CASCADE;

ALTER TABLE public.link_categories DROP CONSTRAINT IF EXISTS link_categories_category_id_fkey;
ALTER TABLE public.link_categories
  ADD CONSTRAINT link_categories_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;

ALTER TABLE public.link_categories DROP CONSTRAINT IF EXISTS link_categories_user_id_fkey;
ALTER TABLE public.link_categories
  ADD CONSTRAINT link_categories_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- RLS — owner-only policies (single source of truth)
-- Policy names match the historical SUPABASE_SETUP.md so re-runs replace them.
-- -----------------------------------------------------------------------------

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own links" ON public.links;
DROP POLICY IF EXISTS "Users can insert own links" ON public.links;
DROP POLICY IF EXISTS "Users can update own links" ON public.links;
DROP POLICY IF EXISTS "Users can delete own links" ON public.links;

CREATE POLICY "Users can view own links" ON public.links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links" ON public.links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON public.links
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON public.links
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own link_categories" ON public.link_categories;
DROP POLICY IF EXISTS "Users can insert own link_categories" ON public.link_categories;
DROP POLICY IF EXISTS "Users can update own link_categories" ON public.link_categories;
DROP POLICY IF EXISTS "Users can delete own link_categories" ON public.link_categories;

CREATE POLICY "Users can view own link_categories" ON public.link_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own link_categories" ON public.link_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own link_categories" ON public.link_categories
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own link_categories" ON public.link_categories
  FOR DELETE USING (auth.uid() = user_id);

COMMIT;
