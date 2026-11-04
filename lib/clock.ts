/** The current time. Pages call this after `await connection()`, so it is read at request time, not at build time. */
export function serverNow(): number {
  return Date.now();
}
