# Schemas das Tabelas do Supabase

## 1. Tabela Categories

```sql
-- Criar tabela de categorias
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Política para ver apenas suas próprias categorias
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

-- Política para inserir suas próprias categorias
CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para atualizar suas próprias categorias
CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para deletar suas próprias categorias
CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);
```

## 2. Tabela Links

```sql
-- Criar tabela de links
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Política para ver apenas seus próprios links
CREATE POLICY "Users can view own links" ON links
  FOR SELECT USING (auth.uid() = user_id);

-- Política para inserir seus próprios links
CREATE POLICY "Users can insert own links" ON links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para atualizar seus próprios links
CREATE POLICY "Users can update own links" ON links
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para deletar seus próprios links
CREATE POLICY "Users can delete own links" ON links
  FOR DELETE USING (auth.uid() = user_id);
```

## 3. Tabela Link_Categories (Relacionamento)

```sql
-- Criar tabela de relacionamento entre links e categorias
CREATE TABLE link_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(link_id, category_id)
);

-- Habilitar RLS
ALTER TABLE link_categories ENABLE ROW LEVEL SECURITY;

-- Política para ver apenas seus próprios relacionamentos
CREATE POLICY "Users can view own link_categories" ON link_categories
  FOR SELECT USING (auth.uid() = user_id);

-- Política para inserir seus próprios relacionamentos
CREATE POLICY "Users can insert own link_categories" ON link_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para deletar seus próprios relacionamentos
CREATE POLICY "Users can delete own link_categories" ON link_categories
  FOR DELETE USING (auth.uid() = user_id);
```

## 4. Script Completo para Execução

Execute este script completo no SQL Editor do Supabase:

```sql
-- ================================================
-- CATEGORIAS
-- ================================================

CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- LINKS
-- ================================================

CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own links" ON links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own links" ON links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own links" ON links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own links" ON links
  FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- RELACIONAMENTO LINK-CATEGORIAS
-- ================================================

CREATE TABLE link_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(link_id, category_id)
);

ALTER TABLE link_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own link_categories" ON link_categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own link_categories" ON link_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own link_categories" ON link_categories
  FOR DELETE USING (auth.uid() = user_id);
```

## Estrutura Final

- **categories**: Categorias do usuário
- **links**: Links do usuário 
- **link_categories**: Relacionamento N:N entre links e categorias
- **RLS habilitado**: Cada usuário vê apenas seus próprios dados
- **CASCADE DELETE**: Se usuário for deletado, todos os dados são removidos
- **Relacionamento flexível**: Links podem ter 0, 1 ou múltiplas categorias
