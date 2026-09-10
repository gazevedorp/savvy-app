# Savvy App - Organizador de Links

Um aplicativo React Native desenvolvido com Expo Router para organizar e gerenciar seus links favoritos com autenticação completa.

## 🚀 Funcionalidades

### ✅ Autenticação
- **Login**: Email e senha
- **Registro**: Nome completo, telefone, email, senha e confirmação
- **Recuperação de senha**: Reset via email
- **Logout**: Sair da conta
- **Proteção de rotas**: Redirecionamento automático

### ✅ Gerenciamento de Links
- Adicionar links de qualquer tipo (web, vídeo, imagem, música, filme, texto)
- Busca de **música** e **filmes** em catálogos públicos (iTunes Search API)
- Tela de detalhe cinematográfica para música e filme (arte, ficha, sinopse)
- Organizar links em categorias
- Marcar como lido/não lido
- Busca e filtros
- Compartilhamento

### ✅ Interface
- Design moderno e responsivo
- Tema claro/escuro
- Animações suaves
- Identidade visual consistente

## 🛠 Tecnologias

- **React Native** com Expo SDK 57
- **Expo Router** para navegação
- **TypeScript** para tipagem
- **Supabase** para autenticação e banco de dados
- **Zustand** para gerenciamento de estado
- **React Native Reanimated 4** para animações
- **Lucide React Native** para ícones

## 📱 Configuração e Instalação

### 1. Pré-requisitos
- Node.js 20+ (24 LTS indicado em `.nvmrc`)
- Yarn Classic 1.22.22 (`yarn.lock` versionado)
- Expo CLI / Expo Go compatível com SDK 57
- Conta no Supabase

### 2. Instalação
```bash
# Clone o repositório
git clone [url-do-repositorio]
cd savvy-app

# Instale as dependências
npm install

# Configure o Supabase (veja SUPABASE_SETUP.md)
cp .env.example .env.local
# Edite .env.local com suas credenciais
```

### 3. Configuração do Supabase
Siga o guia detalhado em [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)

### 4. Executar o projeto
```bash
# Desenvolvimento
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web

# Checagem de tipos
yarn typecheck

# Testes (sem watch)
yarn test:ci
```

## Expo SDK 57

O app roda em **Expo SDK 57** (React Native 0.86, React 19.2, Reanimated 4 + Worklets). A Nova Arquitetura está habilitada.

```sh
yarn install --frozen-lockfile
yarn typecheck
yarn test:ci
npx expo install --check
```

Ao atualizar o SDK de novo, siga o [guia oficial](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/) e as [notas do SDK 57](https://expo.dev/changelog/sdk-57).

## 🎵 Música e filmes (APIs públicas)

A aba **Buscar** tem três modos: **Salvos**, **Música** e **Filmes**.

| Tipo | API | Chave |
| --- | --- | --- |
| Música (faixas e álbuns) | [iTunes Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html) | Nenhuma |
| Música (fallback) | [Deezer Search](https://developers.deezer.com/api) | Nenhuma |
| Filmes | Wikipédia (pt) + iTunes (`feature-movie`) | Nenhuma |
| Filmes (preferencial) | [TMDB](https://developer.themoviedb.org/docs) | Opcional, `EXPO_PUBLIC_TMDB_API_KEY` |

A busca de música usa a iTunes Search API (faixas e álbuns reais: arte, artista, ano, gênero, prévia). Filmes usam a Wikipédia em português (título, pôster, ano, sinopse) e, se houver, o TMDB. Não use texto livre como resultado: só o que a API retornar aparece na lista.

Ao salvar um resultado, o app grava título, URL, thumbnail e um objeto `metadata` (artista, álbum, gêneros, duração, etc.). A tela de detalhe de música/filme usa esse metadata: hero com artwork, chips e sinopse. Links, vídeos, imagens e notas continuam com o layout genérico.

### Variáveis de ambiente

```bash
# Obrigatório para login / persistência
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Opcional — país da iTunes Store (padrão BR)
EXPO_PUBLIC_ITUNES_COUNTRY=BR

# Opcional — melhora a busca de filmes (pôsteres e ficha técnica)
EXPO_PUBLIC_TMDB_API_KEY=
```

### Banco (migração segura)

O campo `links.metadata` é JSONB. Se a tabela já existir, rode:

```sql
ALTER TABLE links ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;
```

Sem essa coluna o app ainda salva título/descrição/arte e guarda o metadata extra no AsyncStorage até a migração ser aplicada.

## 📁 Estrutura do Projeto

```
app/
├── auth/                 # Telas de autenticação
│   ├── login.tsx        # Tela de login
│   ├── register.tsx     # Tela de registro
│   ├── forgot-password.tsx # Recuperação de senha
│   └── _layout.tsx      # Layout das telas de auth
├── (tabs)/              # Telas principais (tabs)
│   ├── index.tsx        # Home - lista de links
│   ├── categories.tsx   # Gerenciar categorias
│   ├── search.tsx       # Busca
│   └── settings.tsx     # Configurações
├── link/                # Detalhes do link
└── share/               # Compartilhamento

components/
├── ui/                  # Componentes de UI
│   ├── Logo.tsx         # Logo do app
│   ├── InputField.tsx   # Campo de entrada
│   ├── Button.tsx       # Botão customizado
│   ├── LinkCard.tsx     # Card de link
│   └── CategoryCard.tsx # Card de categoria
├── modals/              # Modais
└── AuthGuard.tsx        # Proteção de rotas

context/
├── ThemeContext.tsx     # Tema claro/escuro
└── AuthContext.tsx      # Autenticação

lib/
└── supabase.ts          # Configuração do Supabase

store/
├── linkStore.ts         # Estado dos links
└── categoryStore.ts     # Estado das categorias
```

## 🎨 Temas e Personalização

O app suporta tema claro e escuro com cores personalizáveis:

```typescript
// Em context/ThemeContext.tsx
const lightColors = {
  primary: '#0A84FF',
  background: '#F9F9FB',
  card: '#FFFFFF',
  text: '#1C1C1E',
  // ...
};
```

## 🔐 Autenticação

### Fluxo de Autenticação
1. **Usuário não autenticado**: Redirecionado para `/auth/login`
2. **Login bem-sucedido**: Redirecionado para `/(tabs)`
3. **Logout**: Volta para `/auth/login`

### Telas de Auth
- **Login**: Email + senha + link para recuperação e registro
- **Registro**: Nome, telefone, email, senha e confirmação
- **Recuperação**: Email + confirmação visual

### Proteção de Rotas
O `AuthGuard` verifica automaticamente o estado da autenticação e redireciona conforme necessário.

## 📊 Banco de Dados (Supabase)

### Tabelas
- `auth.users`: Usuários com metadados customizados (gerenciado pelo Supabase)

### Dados do Usuário
- Armazenados em `user_metadata` do auth nativo
- Nome completo e telefone salvos automaticamente
- Sem necessidade de tabelas customizadas

## 🚀 Deploy

### Expo Build
```bash
# Build para produção
eas build --platform all

# Update OTA
eas update
```

### Configurações necessárias
- Configure as variáveis de ambiente no Expo
- Configure deep links no app.json
- Configure email templates no Supabase

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvimento

### Componentes Reutilizáveis
- `InputField`: Campo de entrada com validação
- `Button`: Botão com estados de loading
- `Logo`: Logo consistente do app

### Estados
- `useAuth`: Hook para autenticação
- `useTheme`: Hook para temas
- `useLinkStore`: Store dos links
- `useCategoryStore`: Store das categorias

### Validações
- Email format
- Senha mínima (6 caracteres)
- Telefone formatado automaticamente
- Confirmação de senha

---

**Desenvolvido com ❤️ por Gabriel Azevedo**
