jest.mock('expo-linking', () => ({
  createURL: (path: string) => `savvyapp://${path.replace(/^\//, '')}`,
}));

import {
  AUTH_CONFIRM_PATH,
  AUTH_RESET_PATH,
  getAuthRedirectUrl,
  isAuthCallbackUrl,
  parseAuthCallbackParams,
} from '@/utils/authLinks';

describe('auth deep links', () => {
  it('builds recovery and confirm URLs from the app scheme', () => {
    expect(getAuthRedirectUrl()).toBe('savvyapp://auth/reset-password');
    expect(getAuthRedirectUrl(AUTH_RESET_PATH)).toBe('savvyapp://auth/reset-password');
    expect(getAuthRedirectUrl(AUTH_CONFIRM_PATH)).toBe('savvyapp://auth/login');
    expect(getAuthRedirectUrl()).not.toContain('com.savvyapp');
  });

  it('parses PKCE code and implicit recovery tokens', () => {
    expect(
      parseAuthCallbackParams('savvyapp://auth/reset-password?code=pkce-code')
    ).toEqual({ code: 'pkce-code' });

    expect(
      parseAuthCallbackParams(
        'savvyapp://auth/reset-password#access_token=aaa&refresh_token=bbb&type=recovery'
      )
    ).toEqual({
      accessToken: 'aaa',
      refreshToken: 'bbb',
      type: 'recovery',
    });

    expect(
      parseAuthCallbackParams('exp://127.0.0.1:8081/--/auth/reset-password?code=from-go')
    ).toEqual({ code: 'from-go' });
  });

  it('detects callback URLs and ignores plain routes', () => {
    expect(isAuthCallbackUrl('savvyapp://auth/reset-password?code=abc')).toBe(true);
    expect(isAuthCallbackUrl('savvyapp://auth/login')).toBe(false);
    expect(isAuthCallbackUrl('')).toBe(false);
  });
});
