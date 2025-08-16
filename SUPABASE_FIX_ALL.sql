-- Script completo para corrigir problemas do Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. CORRIGIR FOREIGN KEY PARA DELETAR LINKS
-- Remover a constraint antiga
ALTER TABLE link_categories DROP CONSTRAINT IF EXISTS link_categories_link_id_fkey;

-- Adicionar novamente com ON DELETE CASCADE
ALTER TABLE link_categories
  ADD CONSTRAINT link_categories_link_id_fkey
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE;

-- Fazer o mesmo para category_id
ALTER TABLE link_categories DROP CONSTRAINT IF EXISTS link_categories_category_id_fkey;

ALTER TABLE link_categories
  ADD CONSTRAINT link_categories_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE;

-- 2. CRIAR BUCKET PARA IMAGENS (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('savvy-images', 'savvy-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- 4. CRIAR POLÍTICAS CORRETAS PARA STORAGE (Versão Simplificada)
-- Primeiro, políticas para BUCKETS (permitir listar e acessar buckets)
CREATE POLICY "Allow public to view buckets" ON storage.buckets
  FOR SELECT 
  USING (true);

-- Política para permitir upload de imagens pelos usuários autenticados
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'savvy-images'::text 
    AND auth.role() = 'authenticated'::text
  );

-- Política para permitir visualização de imagens públicas
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'savvy-images'::text);

-- Política para permitir deletar suas próprias imagens
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'savvy-images'::text 
    AND auth.role() = 'authenticated'::text
  );

-- 5. VERIFICAR SE AS POLÍTICAS ESTÃO ATIVAS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 6. VERIFICAR SE O BUCKET EXISTE
SELECT * FROM storage.buckets WHERE id = 'savvy-images';

-- 7. VERSÃO ALTERNATIVA - SE A ACIMA NÃO FUNCIONAR, TENTE ESTA:
/*
-- Primeiro, ativar RLS na tabela objects se não estiver ativo
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas
DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Política simples para upload (qualquer usuário autenticado)
CREATE POLICY "Allow authenticated upload to savvy-images" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'savvy-images');

-- Política para visualização pública
CREATE POLICY "Allow public read from savvy-images" ON storage.objects
  FOR SELECT 
  TO public
  USING (bucket_id = 'savvy-images');

-- Política para deletar (qualquer usuário autenticado)
CREATE POLICY "Allow authenticated delete from savvy-images" ON storage.objects
  FOR DELETE 
  TO authenticated
  USING (bucket_id = 'savvy-images');
*/
