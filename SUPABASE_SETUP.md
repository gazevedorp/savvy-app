# Configuração do Supabase

## 1. Criar Projeto no Supabase

1. Vá para [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Dashboard → **Project Settings → API**
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_public_key>
```

**⚠️ Importante**: nunca commite `.env.local` — já está no `.gitignore`.

## 3. Aplicar o schema (Phase C)

Não cole SQL solto dos docs antigos. O caminho versionado é:

[`migrations/20260910_phase_c_supabase_baseline.sql`](./migrations/20260910_phase_c_supabase_baseline.sql)

1. Abra **SQL Editor** no projeto
2. Cole o arquivo inteiro e rode uma vez
3. Reexecutar é seguro (`IF NOT EXISTS` / `DROP POLICY IF EXISTS`)

O script cria/alinha:

- Tabelas `categories`, `links`, `link_categories`
- Coluna `links.metadata` JSONB
- CHECK em `type`: `link | video | image | music | movie | other`
- Índices `(user_id, created_at)`, `(user_id, is_read)`, GIN em `metadata`
- RLS owner-only nas três tabelas
- FKs de `link_categories` com `ON DELETE CASCADE`

Detalhes: [`migrations/README.md`](./migrations/README.md) e [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).

Storage de imagens (bucket `savvy-images`) é Phase D — [`SUPABASE_STORAGE_SETUP.md`](./SUPABASE_STORAGE_SETUP.md).

`SUPABASE_FIX_ALL.sql` está **deprecated** para schema/RLS; não use como caminho principal.

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

1. Execute o app com `yarn start` (ou `npm start`)
2. Teste o registro de usuário
3. Verifique se o email de confirmação é enviado
4. Teste o login
5. Teste a recuperação de senha
6. Teste o logout
7. Salve um link de música/filme e confira se `metadata` volta do banco (SQL: `select id, type, metadata from links limit 5`)

## Funcionalidades Implementadas

✅ **Tela de Login** — email, senha, recuperação, registro  
✅ **Tela de Registro** — nome, telefone, email, senha  
✅ **Tela de Recuperação de Senha**  
✅ **Integração com Supabase** — auth nativo, `user_metadata`, UUIDs do banco  
✅ **Proteção de Rotas** — `AuthGuard`  
✅ **Banco de Dados (Phase C)** — `metadata` JSONB, tipos alinhados ao app, RLS consolidado, índices

## Estrutura das Tabelas

### `categories`

- **id**: UUID (auto)
- **name**, **color**, **icon**
- **user_id**, **created_at**

### `links`

- **id**: UUID (auto)
- **url**, **title**, **description**, **thumbnail**
- **type**: `link | video | image | music | movie | other`
- **metadata**: JSONB (música/filme — artista, arte, gêneros, prévia, …)
- **user_id**, **is_read**, **read_at**, **progress**, **created_at**

### `link_categories`

- **id**: UUID (auto)
- **link_id**, **category_id**, **user_id**, **created_at**
- Unique `(link_id, category_id)`

## Personalização

- `components/ui/Logo.tsx` — Logo do app
- `context/ThemeContext.tsx` — Cores e temas
- `components/ui/InputField.tsx` — Campos de entrada
- `components/ui/Button.tsx` — Botões
