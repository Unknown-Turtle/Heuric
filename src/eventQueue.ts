// ---------------------------------------------------------------------------
// Event queue — in-memory buffer with auto-flush and unload handling
// ---------------------------------------------------------------------------

import type { HeuricEvent } from './types';
import { sendBatch, sendBeaconBatch } from './sender';

const DEFAULT_FLUSH_INTERVAL = 5_000; // 5 seconds
const DEFAULT_FLUSH_THRESHOLD = 20;

let queue: HeuricEvent[] = [];
let endpoint = '';
let flushTimer: ReturnType<typeof setInterval> | null = null;
let threshold = DEFAULT_FLUSH_THRESHOLD;

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Configure the queue with the target endpoint and optional thresholds.
 */
export function configureQueue(
  ep: string,
  opts?: { flushInterval?: number; flushThreshold?: number },
): void {
  endpoint = ep;
  threshold = opts?.flushThreshold ?? DEFAULT_FLUSH_THRESHOLD;
  startAutoFlush(opts?.flushInterval ?? DEFAULT_FLUSH_INTERVAL);
  registerUnloadFlush();
}

/**
 * Push an event onto the queue.
 * Triggers an immediate flush when the threshold is reached.
 */
export function push(event: HeuricEvent): void {
  queue.push(event);
  if (queue.length >= threshold) {
    flush();
  }
}

/**
 * Drain the queue and send all buffered events via async fetch.
 */
export function flush(): void {
  if (queue.length === 0) return;
  const batch = queue;
  queue = [];
  sendBatch(endpoint, batch);
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function startAutoFlush(interval: number): void {
  if (flushTimer !== null) return;
  flushTimer = setInterval(flush, interval);
}

/**
 * On visibility-hidden or page-hide, drain via sendBeacon so nothing is lost.
 */
function registerUnloadFlush(): void {
  const beaconFlush = (): void => {
    if (queue.length === 0) return;
    const batch = queue;
    queue = [];
    sendBeaconBatch(endpoint, batch);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      beaconFlush();
    }
  });

  window.addEventListener('pagehide', beaconFlush);
}
