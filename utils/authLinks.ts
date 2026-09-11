import * as Linking from 'expo-linking';

export const AUTH_RESET_PATH = 'auth/reset-password';
export const AUTH_CONFIRM_PATH = 'auth/login';

export function getAuthRedirectUrl(path: string = AUTH_RESET_PATH): string {
  return Linking.createURL(path.replace(/^\//, ''));
}

export function parseAuthCallbackParams(url: string): {
  code?: string;
  accessToken?: string;
  refreshToken?: string;
  type?: string;
} {
  if (!url) return {};

  const [withoutHash, hash = ''] = url.split('#');
  const queryIndex = withoutHash.indexOf('?');
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : '';
  const queryParams = new URLSearchParams(query);
  const hashParams = new URLSearchParams(hash);

  const read = (key: string) => hashParams.get(key) || queryParams.get(key) || undefined;

  const code = read('code');
  const accessToken = read('access_token');
  const refreshToken = read('refresh_token');
  const type = read('type');

  return {
    ...(code ? { code } : {}),
    ...(accessToken ? { accessToken } : {}),
    ...(refreshToken ? { refreshToken } : {}),
    ...(type ? { type } : {}),
  };
}

export function isAuthCallbackUrl(url: string): boolean {
  const parsed = parseAuthCallbackParams(url);
  return Boolean(parsed.code || parsed.accessToken || parsed.type);
}
