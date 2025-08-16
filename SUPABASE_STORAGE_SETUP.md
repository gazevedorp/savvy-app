# Supabase Storage Setup

## Passo 1: Criar Bucket para Imagens

### Via Interface do Supabase (RECOMENDADO)
1. Vá para **Storage** no painel do Supabase
2. Clique em **"Create a new bucket"**
3. Nome: `savvy-images`
4. Marque como **"Public bucket"**
5. Clique em **"Save"**

### Via SQL (Alternativa)
Execute este script no SQL Editor do Supabase para criar o bucket de armazenamento de imagens:

```sql
-- Criar bucket para imagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('savvy-images', 'savvy-images', true);
```

## Passo 2: Configurar Políticas de Segurança

Execute estas políticas no **SQL Editor** do Supabase:

```sql
-- Política para permitir upload de imagens pelos usuários autenticados
CREATE POLICY "Users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'savvy-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Política para permitir visualização de imagens públicas
CREATE POLICY "Public can view images" ON storage.objects
  FOR SELECT USING (bucket_id = 'savvy-images');

-- Política para permitir deletar suas próprias imagens
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'savvy-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Passo 3: Verificar Configuração

### 3.1 Verificar se o bucket foi criado
1. Vá para **Storage** > **savvy-images**
2. Confirme que o bucket aparece como **"Public"**

### 3.2 Verificar as políticas
1. Clique no bucket **savvy-images**
2. Vá para a aba **"Policies"**
3. Confirme que as 3 políticas aparecem como **ENABLED**

### 3.3 Testar upload manual
1. No bucket **savvy-images**, clique em **"Upload file"**
2. Faça upload de uma imagem de teste
3. Verifique se consegue visualizar a imagem

## Passo 4: Verificar Variáveis de Ambiente

No seu projeto, confirme que estas variáveis estão corretas:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

## Troubleshooting

### Erro 400 "Network request failed"
- [ ] Bucket `savvy-images` existe e está público?
- [ ] Políticas aplicadas e ENABLED?
- [ ] Usuário está autenticado?
- [ ] Variáveis de ambiente corretas?

### Erro "Bucket not found"
- Execute o Passo 1 novamente para criar o bucket

### Erro "Insufficient permissions"
- Execute o Passo 2 novamente para aplicar as políticas
