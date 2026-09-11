import { Alert } from 'react-native';

type ErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: number;
  statusCode?: string | number;
};

export class AppError extends Error {
  readonly userMessage: string;

  constructor(userMessage: string, options?: { cause?: unknown }) {
    super(userMessage);
    this.name = 'AppError';
    this.userMessage = userMessage;
    if (options?.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

function asErrorLike(error: unknown): ErrorLike {
  if (!error || typeof error !== 'object') {
    return { message: typeof error === 'string' ? error : undefined };
  }
  return error as ErrorLike;
}

function combinedText(error: unknown): string {
  const e = asErrorLike(error);
  return [e.message, e.details, e.hint, e.code].filter(Boolean).join(' ').toLowerCase();
}

export function toUserMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (error instanceof AppError) return error.userMessage;

  const e = asErrorLike(error);
  const mapped = mapText(combinedText(error), e.code ?? String(e.statusCode ?? e.status ?? ''), fallback);

  if (mapped !== fallback) return mapped;

  if (error instanceof Error && looksUserFacing(error.message)) {
    return error.message;
  }

  return fallback;
}

function looksUserFacing(message: string): boolean {
  return /^(Não |Faça |Sem |O banco|O armazenamento|A imagem|Este |Você |Item |Categoria |Falha )/i.test(
    message
  );
}

function mapText(text: string, code: string | undefined, fallback: string): string {
  const t = (text || '').toLowerCase();
  const c = (code || '').toUpperCase();

  if (
    t.includes('not_authenticated') ||
    t.includes('não autenticado') ||
    t.includes('not authenticated') ||
    t.includes('user not authenticated') ||
    c === '28000' ||
    c === '401'
  ) {
    return 'Faça login para continuar.';
  }

  if (
    t.includes('failed to fetch') ||
    t.includes('network request failed') ||
    t.includes('networkerror')
  ) {
    return 'Sem conexão. Verifique a internet e tente de novo.';
  }

  if (
    t.includes('save_link_with_categories') ||
    (t.includes('function') && t.includes('does not exist')) ||
    (t.includes('could not find the function') && t.includes('save_link'))
  ) {
    return 'O banco precisa da migração Phase D. Veja migrations/README.md.';
  }

  if (t.includes('bucket not found') || t.includes('bucket does not exist')) {
    return 'O armazenamento de imagens ainda não foi configurado. Veja SUPABASE_STORAGE_SETUP.md.';
  }

  if (
    t.includes('payload too large') ||
    t.includes('maximum allowed size') ||
    t.includes('entity too large') ||
    c === '413'
  ) {
    return 'A imagem é grande demais.';
  }

  if (c === '23505' || t.includes('duplicate key') || t.includes('unique constraint')) {
    return 'Este item já existe.';
  }

  if (c === '23503' || t.includes('foreign key') || t.includes('violates foreign key')) {
    return 'Categoria inválida. Atualize a lista e tente de novo.';
  }

  if (c === '42501' || c === 'PGRST301' || t.includes('row-level security') || t.includes('permission denied')) {
    return 'Você não tem permissão para esta ação.';
  }

  if (t.includes('link_not_found') || c === 'P0002') {
    return 'Item não encontrado.';
  }

  return fallback;
}

export function failWithUserMessage(error: unknown, fallback: string): AppError {
  return new AppError(toUserMessage(error, fallback), { cause: error });
}

export function alertError(error: unknown, fallback: string, title = 'Erro'): void {
  Alert.alert(title, toUserMessage(error, fallback));
}
