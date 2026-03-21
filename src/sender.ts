// ---------------------------------------------------------------------------
// Sender — HTTP transport for event batches
// ---------------------------------------------------------------------------

import type { HeuricEvent } from './types';

/**
 * Send an event batch via async `fetch` (used during normal page lifetime).
 * Fire-and-forget — errors are silently swallowed to avoid impacting the host page.
 */
export async function sendBatch(
  endpoint: string,
  events: HeuricEvent[],
): Promise<void> {
  if (events.length === 0) return;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    });
  } catch {
    // Swallow — SDK must never throw into the host page
  }
}

/**
 * Send an event batch via `navigator.sendBeacon` (used on page unload).
 * sendBeacon is non-blocking and survives page teardown.
 */
export function sendBeaconBatch(
  endpoint: string,
  events: HeuricEvent[],
): void {
  if (events.length === 0) return;

  try {
    const blob = new Blob([JSON.stringify({ events })], {
      type: 'application/json',
    });
    navigator.sendBeacon(endpoint, blob);
  } catch {
    // Swallow
  }
}
