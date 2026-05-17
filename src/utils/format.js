/**
 * Shared formatting/derivation helpers used across pages.
 */

/**
 * Deterministically map a string to one of 8 avatar gradient variants
 * (defined as .posting-avatar--0 through --7 in pages.css).
 */
export function avatarVariant(text) {
  if (!text) return 0;
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h) % 8;
}

/**
 * First character of a string, uppercased. Returns "?" for empty input.
 */
export function avatarInitial(text) {
  if (!text) return "?";
  return String(text).trim().charAt(0).toUpperCase();
}

/**
 * Days from now until the given date, floored at 0 (no negative countdowns).
 * Returns null if date is invalid/missing.
 */
export function daysUntil(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

/**
 * True if the given date is within the last `days` days (and not in the future).
 */
export function isRecent(dateStr, days = 7) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const diffDays = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
}
