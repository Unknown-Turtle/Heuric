// ---------------------------------------------------------------------------
// Utility helpers — session IDs, coordinate math, text sanitisation
// ---------------------------------------------------------------------------

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const DIGITS_RE = /\b\d{4,}\b/g;
const MONETARY_RE = /[$€£¥]\s?\d[\d,.]*/g;

/**
 * Generate a unique session identifier.
 * Prefers `crypto.randomUUID()` with a Math.random fallback.
 */
export function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: pseudo-random UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Normalise a coordinate value to `[0, 1]`.
 */
export function normalizeCoord(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(Math.max(value / max, 0), 1);
}

/**
 * Truncate a string to `maxLen` characters, appending '…' when trimmed.
 */
export function truncateText(str: string, maxLen = 50): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

/**
 * Scrub likely PII from visible text.
 * - Email addresses → `[EMAIL]`
 * - Monetary values  → `[NUMBER]`
 * - Strings of 4+ digits → `[NUMBER]`
 */
export function scrubPII(str: string): string {
  return str
    .replace(EMAIL_RE, '[EMAIL]')
    .replace(MONETARY_RE, '[NUMBER]')
    .replace(DIGITS_RE, '[NUMBER]');
}

/**
 * Return the current page URL (captured fresh for SPA compatibility).
 */
export function getCurrentUrl(): string {
  return window.location.href;
}
