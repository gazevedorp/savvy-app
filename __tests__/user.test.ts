import { getUserInitials } from '@/utils/user';

describe('getUserInitials', () => {
  it('uses first and last name when present', () => {
    expect(getUserInitials('Gabriel Azevedo', 'gabe@example.com')).toBe('GA');
    expect(getUserInitials('Ana', 'ana@example.com')).toBe('AN');
  });

  it('falls back to email or Savvy', () => {
    expect(getUserInitials('', 'savvy.user@example.com')).toBe('SA');
    expect(getUserInitials(undefined, 'a@example.com')).toBe('AS');
    expect(getUserInitials(undefined, undefined)).toBe('SV');
  });
});
