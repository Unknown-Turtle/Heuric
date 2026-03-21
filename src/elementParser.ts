// ---------------------------------------------------------------------------
// Element parser — extracts metadata from DOM targets with privacy guardrails
// ---------------------------------------------------------------------------

import { scrubPII, truncateText } from './utils';
import type { ElementMeta } from './types';

/** SVG-related tag names that should be resolved to a parent container. */
const SVG_TAGS = new Set([
  'svg', 'path', 'circle', 'ellipse', 'line', 'polygon',
  'polyline', 'rect', 'g', 'use', 'text', 'tspan', 'defs',
]);

/** Selector for the nearest "meaningful" HTML ancestor. */
const MEANINGFUL_ANCESTOR =
  'button, a, [role="button"], label, li, td, th, div, span';

// ── SVG target resolution ────────────────────────────────────────────────────

/**
 * If the target is an SVG element, walk up to the nearest meaningful HTML
 * container so we capture useful metadata instead of `<path>` junk.
 */
export function resolveTarget(el: Element): Element {
  const tag = el.tagName.toLowerCase();
  if (SVG_TAGS.has(tag)) {
    const ancestor = el.closest(MEANINGFUL_ANCESTOR);
    if (ancestor) return ancestor;
  }
  return el;
}

// ── Privacy guardrails ───────────────────────────────────────────────────────

/**
 * Returns `true` if the element (or any ancestor) should be ignored.
 *
 * Ignored elements:
 * - `<input type="password">`
 * - `<input type="hidden">`
 * - Elements whose `autocomplete` attribute starts with `cc-`
 * - Elements (or ancestors) carrying the `.heuric-ignore` class
 */
export function shouldIgnore(el: Element): boolean {
  // Walk up ancestors for `.heuric-ignore`
  if (el.closest('.heuric-ignore')) return true;

  const tag = el.tagName.toLowerCase();
  if (tag === 'input') {
    const type = (el as HTMLInputElement).type.toLowerCase();
    if (type === 'password' || type === 'hidden') return true;
  }

  const ac = el.getAttribute('autocomplete') ?? '';
  if (ac.startsWith('cc-')) return true;

  return false;
}

// ── Selector builder ─────────────────────────────────────────────────────────

/**
 * Build a minimal CSS selector for `el`.
 * Priority: tag#id → tag.class → tag:nth-child(n)
 */
export function getSelector(el: Element): string {
  const tag = el.tagName.toLowerCase();

  if (el.id) {
    return `${tag}#${el.id}`;
  }

  if (el.classList.length > 0) {
    // Use at most the first two class names to keep selectors short
    const classes = Array.from(el.classList).slice(0, 2).join('.');
    return `${tag}.${classes}`;
  }

  // Fallback: use nth-child relative to the parent
  const parent = el.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children);
    const idx = siblings.indexOf(el) + 1;
    return `${tag}:nth-child(${idx})`;
  }

  return tag;
}

// ── Main parser ──────────────────────────────────────────────────────────────

/**
 * Extract metadata from a DOM element.
 * Applies SVG target resolution, PII scrubbing, and text truncation.
 */
export function parseElement(rawEl: Element): ElementMeta {
  const el = resolveTarget(rawEl);
  const rect = el.getBoundingClientRect();

  // Get visible text — prefer `textContent` trimmed, then fall back to aria-label
  let rawText =
    (el as HTMLElement).innerText?.trim() ??
    el.getAttribute('aria-label') ??
    '';

  // Scrub PII and truncate
  const text = truncateText(scrubPII(rawText));

  return {
    tag: el.tagName.toLowerCase(),
    text,
    selector: getSelector(el),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
}
