/**
 * PostgREST / Postgres signals that `links.metadata` is not on the remote schema.
 * Kept as a safety net until every environment has applied Phase C.
 * Phase D can drop the retry + AsyncStorage dual-write once that is guaranteed.
 */
export function isMissingMetadataColumn(
  error: { message?: string; code?: string } | null | undefined
): boolean {
  if (!error) return false;
  const message = (error.message || '').toLowerCase();
  return (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    (message.includes('metadata') &&
      (message.includes('column') ||
        message.includes('schema cache') ||
        message.includes('could not find')))
  );
}
