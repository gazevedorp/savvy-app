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
- Adicionar links de qualquer tipo (web, vídeo, imagem, música, texto)
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

- **React Native** com Expo
- **Expo Router** para navegação
- **TypeScript** para tipagem
- **Supabase** para autenticação e banco de dados
- **Zustand** para gerenciamento de estado
- **React Native Reanimated** para animações
- **Lucide React Native** para ícones

## 📱 Configuração e Instalação

### 1. Pré-requisitos
- Node.js 18+
- Expo CLI
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
```

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
