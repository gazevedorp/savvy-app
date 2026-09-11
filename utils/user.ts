export function getUserInitials(fullName?: string, email?: string): string {
  const name = fullName?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  const local = email?.split('@')[0]?.trim() ?? '';
  if (local.length >= 2) {
    return local.slice(0, 2).toUpperCase();
  }
  if (local.length === 1) {
    return `${local}S`.toUpperCase();
  }
  return 'SV';
}
