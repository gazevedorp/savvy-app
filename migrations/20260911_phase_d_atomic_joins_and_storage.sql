-- =============================================================================
-- Savvy Phase D — Atomic link + categories, Storage bucket
-- =============================================================================
-- Requires Phase C baseline:
--   migrations/20260910_phase_c_supabase_baseline.sql
--
-- How to apply
--   1. Supabase Dashboard → SQL Editor → New query
--   2. Paste this entire file and Run
--   3. Confirm no errors
--
-- What this adds
--   - RPC save_link_with_categories(jsonb): one transaction for the link row
--     and its link_categories joins (insert or update)
--   - Public Storage bucket savvy-images + owner-folder policies
--
-- Re-running is safe (CREATE OR REPLACE / DROP POLICY IF EXISTS /
-- ON CONFLICT DO NOTHING).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Atomic save: link row + optional category join rewrite
-- -----------------------------------------------------------------------------
-- Payload keys (all optional except url/title/type on insert):
--   id            uuid    — omit / null to insert
--   url, title, description, thumbnail, type
--   metadata      jsonb | null
--   is_read, read_at, progress
--   category_ids  uuid[]  — if the key is present, joins are replaced
--                           (empty array clears joins). If omitted, joins
--                           are left unchanged (e.g. toggle is_read).
--
-- SECURITY INVOKER: RLS on links / link_categories still applies.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.save_link_with_categories(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_id uuid;
  v_link public.links%ROWTYPE;
  v_category_ids uuid[] := '{}';
  v_has_categories boolean;
  v_metadata jsonb;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated' USING ERRCODE = '28000';
  END IF;

  v_has_categories := p_payload ? 'category_ids';
  IF v_has_categories THEN
    SELECT COALESCE(array_agg(elem::uuid), '{}')
      INTO v_category_ids
    FROM jsonb_array_elements_text(
      CASE
        WHEN jsonb_typeof(p_payload->'category_ids') = 'array'
          THEN p_payload->'category_ids'
        ELSE '[]'::jsonb
      END
    ) AS elem;
  END IF;

  IF p_payload ? 'metadata' THEN
    IF p_payload->'metadata' IS NULL OR p_payload->'metadata' = 'null'::jsonb THEN
      v_metadata := NULL;
    ELSE
      v_metadata := p_payload->'metadata';
    END IF;
  END IF;

  v_id := NULLIF(p_payload->>'id', '')::uuid;

  IF v_id IS NULL THEN
    INSERT INTO public.links (
      url,
      title,
      description,
      thumbnail,
      type,
      metadata,
      user_id,
      is_read,
      read_at,
      progress
    ) VALUES (
      COALESCE(p_payload->>'url', ''),
      COALESCE(p_payload->>'title', ''),
      p_payload->>'description',
      NULLIF(p_payload->>'thumbnail', ''),
      COALESCE(NULLIF(p_payload->>'type', ''), 'link'),
      CASE WHEN p_payload ? 'metadata' THEN v_metadata ELSE NULL END,
      v_user_id,
      COALESCE((p_payload->>'is_read')::boolean, false),
      NULLIF(p_payload->>'read_at', '')::timestamptz,
      COALESCE((p_payload->>'progress')::integer, 0)
    )
    RETURNING * INTO v_link;
  ELSE
    UPDATE public.links SET
      url = CASE WHEN p_payload ? 'url' THEN COALESCE(p_payload->>'url', url) ELSE url END,
      title = CASE WHEN p_payload ? 'title' THEN COALESCE(p_payload->>'title', title) ELSE title END,
      description = CASE WHEN p_payload ? 'description' THEN p_payload->>'description' ELSE description END,
      thumbnail = CASE WHEN p_payload ? 'thumbnail' THEN NULLIF(p_payload->>'thumbnail', '') ELSE thumbnail END,
      type = CASE WHEN p_payload ? 'type' THEN COALESCE(NULLIF(p_payload->>'type', ''), type) ELSE type END,
      metadata = CASE WHEN p_payload ? 'metadata' THEN v_metadata ELSE metadata END,
      is_read = CASE WHEN p_payload ? 'is_read' THEN (p_payload->>'is_read')::boolean ELSE is_read END,
      read_at = CASE WHEN p_payload ? 'read_at' THEN NULLIF(p_payload->>'read_at', '')::timestamptz ELSE read_at END,
      progress = CASE WHEN p_payload ? 'progress' THEN (p_payload->>'progress')::integer ELSE progress END
    WHERE id = v_id AND user_id = v_user_id
    RETURNING * INTO v_link;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'link_not_found' USING ERRCODE = 'P0002';
    END IF;
  END IF;

  IF v_has_categories THEN
    DELETE FROM public.link_categories
    WHERE link_id = v_link.id
      AND user_id = v_user_id;

    IF v_category_ids IS NOT NULL AND array_length(v_category_ids, 1) > 0 THEN
      INSERT INTO public.link_categories (link_id, category_id, user_id)
      SELECT v_link.id, cid, v_user_id
      FROM unnest(v_category_ids) AS cid;
    END IF;
  END IF;

  RETURN to_jsonb(v_link) || jsonb_build_object(
    'category_ids',
    COALESCE(
      (
        SELECT jsonb_agg(category_id ORDER BY created_at)
        FROM public.link_categories
        WHERE link_id = v_link.id
      ),
      '[]'::jsonb
    )
  );
END;
$$;

COMMENT ON FUNCTION public.save_link_with_categories(jsonb) IS
  'Phase D: insert or update a link and optionally replace its category joins in one transaction.';

REVOKE ALL ON FUNCTION public.save_link_with_categories(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_link_with_categories(jsonb) TO authenticated;

COMMIT;

-- -----------------------------------------------------------------------------
-- Storage: public image bucket (not wrapped in the table transaction —
-- storage catalog lives outside public.)
-- If this block errors in a restricted role, create the bucket in Dashboard
-- (Storage → New bucket → savvy-images, Public) and re-run the policies.
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES ('savvy-images', 'savvy-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;

CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'savvy-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'savvy-images');

CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'savvy-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'savvy-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'savvy-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
