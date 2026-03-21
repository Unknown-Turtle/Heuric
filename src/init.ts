// ---------------------------------------------------------------------------
// init.ts — public entry point for the Heuric Web SDK
// ---------------------------------------------------------------------------

import type { HeuricConfig } from './types';
import { generateSessionId } from './utils';
import { configureQueue } from './eventQueue';
import { startTracking } from './tracker';

let initialised = false;

/**
 * Initialise the Heuric SDK.
 *
 * Call once — subsequent calls are silently ignored.
 *
 * ```js
 * import { initHeuric } from '@heuric/web-sdk';
 *
 * initHeuric({
 *   endpoint: 'https://api.example.com/events',
 *   projectId: 'proj_abc123',
 * });
 * ```
 */
export function initHeuric(config: HeuricConfig): void {
  if (initialised) return;
  initialised = true;

  const { endpoint, projectId, flushInterval, flushThreshold } = config;

  if (!endpoint || !projectId) {
    console.warn('[Heuric] endpoint and projectId are required.');
    return;
  }

  const sessionId = generateSessionId();

  // Wire up the event queue (auto-flush + unload beacon)
  configureQueue(endpoint, { flushInterval, flushThreshold });

  // Attach global DOM listeners
  startTracking(projectId, sessionId);
}
