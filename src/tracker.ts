// ---------------------------------------------------------------------------
// Tracker — global DOM event listeners (click delegation + throttled scroll)
// ---------------------------------------------------------------------------

import type { HeuricEvent } from './types';
import { shouldIgnore, parseElement, resolveTarget } from './elementParser';
import { normalizeCoord, getCurrentUrl } from './utils';
import { push } from './eventQueue';

let projectId = '';
let sessionId = '';

const SCROLL_THROTTLE_MS = 300;

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Attach global listeners. Must be called once from `initHeuric`.
 */
export function startTracking(pid: string, sid: string): void {
  projectId = pid;
  sessionId = sid;

  document.addEventListener('click', handleClick, { capture: true });
  window.addEventListener('scroll', handleScroll, { passive: true });
}

// ── Click handler (event delegation) ─────────────────────────────────────────

function handleClick(e: MouseEvent): void {
  const rawTarget = e.target;
  if (!(rawTarget instanceof Element)) return;

  // Resolve SVG targets first, then check ignore rules
  const target = resolveTarget(rawTarget);
  if (shouldIgnore(target)) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const event: HeuricEvent = {
    project_id: projectId,
    session_id: sessionId,
    event_type: 'click',
    timestamp: Date.now(),
    page_url: getCurrentUrl(),
    viewport: { width: vw, height: vh },
    element: parseElement(rawTarget), // parseElement runs resolveTarget internally too
    position: {
      x: Math.round(e.clientX),
      y: Math.round(e.clientY),
      normalized_x: normalizeCoord(e.clientX, vw),
      normalized_y: normalizeCoord(e.clientY, vh),
    },
    scroll_data: null,
  };

  push(event);
}

// ── Scroll handler (throttled) ───────────────────────────────────────────────

let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

function handleScroll(): void {
  if (scrollTimeout !== null) {
    clearTimeout(scrollTimeout);
  }

  scrollTimeout = setTimeout(() => {
    scrollTimeout = null;

    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const docHeight = document.documentElement.scrollHeight;

    const event: HeuricEvent = {
      project_id: projectId,
      session_id: sessionId,
      event_type: 'scroll',
      timestamp: Date.now(),
      page_url: getCurrentUrl(),
      viewport: { width: vw, height: vh },
      element: null,
      position: {
        x: 0,
        y: Math.round(scrollY),
        normalized_x: 0,
        normalized_y: normalizeCoord(scrollY + vh, docHeight),
      },
      scroll_data: {
        scroll_y: Math.round(scrollY),
        viewport_height: vh,
        doc_height: docHeight,
      },
    };

    push(event);
  }, SCROLL_THROTTLE_MS);
}
