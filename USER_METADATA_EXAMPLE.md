# Exemplo de Uso dos User Metadata

## Como acessar os dados do usuário

```typescript
// Em qualquer componente
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { user } = useAuth();

  return (
    <View>
      <Text>Nome: {user?.full_name}</Text>
      <Text>Email: {user?.email}</Text>
      <Text>Telefone: {user?.phone}</Text>
    </View>
  );
}
```

## Estrutura dos User Metadata

```typescript
// Dados salvos automaticamente no registro
{
  user_metadata: {
    full_name: "João Silva",
    phone: "(11) 99999-9999"
  }
}
```

## Atualizando dados do usuário (futuro)

```typescript
// Se precisar atualizar os dados no futuro
const updateProfile = async (data: { full_name?: string; phone?: string }) => {
  const { error } = await supabase.auth.updateUser({
    data: data
  });
  
  if (error) {
    console.error('Erro ao atualizar perfil:', error);
  }
};
```

## Vantagens desta abordagem

✅ **Simplicidade**: Sem tabelas customizadas
✅ **Segurança**: RLS automático do Supabase Auth
✅ **Performance**: Dados carregados junto com a sessão
✅ **Menos código**: Sem queries adicionais
✅ **Padrão**: Segue as melhores práticas do Supabase
