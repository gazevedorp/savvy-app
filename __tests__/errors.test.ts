import { AppError, toUserMessage } from '@/utils/errors';

describe('toUserMessage', () => {
  it('keeps AppError copy', () => {
    expect(toUserMessage(new AppError('Falha ao enviar a imagem.'), 'fallback')).toBe(
      'Falha ao enviar a imagem.'
    );
  });

  it('maps auth, network and missing RPC', () => {
    expect(toUserMessage(new Error('Usuário não autenticado'), 'x')).toBe(
      'Faça login para continuar.'
    );
    expect(toUserMessage({ message: 'Failed to fetch' }, 'x')).toBe(
      'Sem conexão. Verifique a internet e tente de novo.'
    );
    expect(
      toUserMessage(
        { message: 'Could not find the function public.save_link_with_categories' },
        'x'
      )
    ).toBe('O banco precisa da migração Phase D. Veja migrations/README.md.');
  });

  it('maps storage, unique and RLS codes', () => {
    expect(toUserMessage({ message: 'Bucket not found' }, 'x')).toBe(
      'O armazenamento de imagens ainda não foi configurado. Veja SUPABASE_STORAGE_SETUP.md.'
    );
    expect(toUserMessage({ code: '23505', message: 'duplicate key' }, 'x')).toBe(
      'Este item já existe.'
    );
    expect(toUserMessage({ code: '42501', message: 'permission denied' }, 'x')).toBe(
      'Você não tem permissão para esta ação.'
    );
    expect(toUserMessage({ message: 'link_not_found', code: 'P0002' }, 'x')).toBe(
      'Item não encontrado.'
    );
  });

  it('uses the fallback for unknown errors', () => {
    expect(toUserMessage({ message: 'something exploded' }, 'Não foi possível salvar o item.')).toBe(
      'Não foi possível salvar o item.'
    );
    expect(toUserMessage(null, 'fallback')).toBe('fallback');
  });
});
