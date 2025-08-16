# Configuração do Supabase

## 1. Criar Projeto no Supabase

1. Vá para [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote a URL do projeto e a chave anônima

## 2. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

2. Edite o arquivo `.env.local` e substitua os valores:
```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

**⚠️ Importante**: Nunca commite o arquivo `.env.local` no Git! Ele já está no `.gitignore`.

## 3. Criar Tabelas do Banco de Dados

Execute o seguinte SQL no editor SQL do Supabase (copie tudo de uma vez):

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

## 4. Configurar Autenticação

No dashboard do Supabase, vá em Authentication > Settings e configure:

- **Email confirmations**: Habilitado (para verificação de email)
- **Secure email change**: Habilitado
- **Enable phone confirmations**: Opcional (se quiser SMS)

### Metadados do Usuário

O app armazena os dados do usuário nos `user_metadata` do Supabase:
- `full_name`: Nome completo do usuário
- `phone`: Telefone do usuário

Estes dados são automaticamente salvos durante o registro e ficam disponíveis em `user.user_metadata`.

## 5. Configurar Links Profundos (Deep Links)

Para redirecionamento após reset de senha, configure no app.json:

```json
{
  "expo": {
    "scheme": "com.savvyapp",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": {
            "scheme": "com.savvyapp"
          },
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

## 6. Testar a Integração

1. Execute o app com `npm start`
2. Teste o registro de usuário
3. Verifique se o email de confirmação é enviado
4. Teste o login
5. Teste a recuperação de senha
6. Teste o logout

## Funcionalidades Implementadas

✅ **Tela de Login**
- Email e senha
- Validação de campos
- Esqueceu a senha
- Link para registro

✅ **Tela de Registro**
- Nome completo, telefone, email, senha e confirmação
- Validação de campos
- Formatação automática do telefone
- Link para login

✅ **Tela de Recuperação de Senha**
- Campo de email
- Envio de email de recuperação
- Confirmação visual

✅ **Integração com Supabase**
- Autenticação completa usando auth nativo
- Dados do usuário nos user_metadata
- Proteção de rotas
- Logout
- **UUIDs auto-gerados** - Sistema utiliza UUIDs gerados automaticamente pelo Supabase

✅ **Proteção de Rotas**
- Redirecionamento automático
- Estados de loading
- Verificação de autenticação

✅ **Interface Consistente**
- Segue a identidade visual do app
- Tema claro/escuro
- Componentes reutilizáveis
- Animações suaves

✅ **Banco de Dados**
- Categorias com cores e ícones
- Links com múltiplas categorias
- Sistema de progresso de leitura
- Row Level Security (RLS)
- UUIDs auto-gerados pelo Supabase

## Estrutura das Tabelas

### Tabela `categories`
- **id**: UUID (auto-gerado pelo Supabase)
- **name**: Nome da categoria
- **color**: Cor da categoria em hex
- **icon**: Ícone da categoria (opcional)
- **user_id**: Referência ao usuário autenticado
- **created_at**: Data de criação

### Tabela `links`
- **id**: UUID (auto-gerado pelo Supabase)
- **url**: URL do link
- **title**: Título do link
- **description**: Descrição (opcional)
- **thumbnail**: URL da imagem thumbnail (opcional)
- **type**: Tipo do link (article, video, podcast, image, document, other)
- **user_id**: Referência ao usuário autenticado
- **is_read**: Status de leitura
- **read_at**: Data/hora de leitura
- **progress**: Progresso de leitura/visualização (0-100)
- **created_at**: Data de criação

### Tabela `link_categories`
- **id**: UUID (auto-gerado pelo Supabase)
- **link_id**: Referência ao link
- **category_id**: Referência à categoria
- **user_id**: Referência ao usuário autenticado
- **created_at**: Data de criação

## Personalização

Para personalizar o visual, edite os arquivos:
- `components/ui/Logo.tsx` - Logo do app
- `context/ThemeContext.tsx` - Cores e temas
- `components/ui/InputField.tsx` - Campos de entrada
- `components/ui/Button.tsx` - Botões
