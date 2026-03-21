/** Configuration passed to `initHeuric()`. */
export interface HeuricConfig {
  /** The endpoint URL where event batches are POSTed. */
  endpoint: string;
  /** Your Heuric project identifier. */
  projectId: string;
  /** Flush interval in milliseconds (default: 5000). */
  flushInterval?: number;
  /** Max events before an automatic flush (default: 20). */
  flushThreshold?: number;
}

/** Viewport dimensions at the moment of the event. */
export interface Viewport {
  width: number;
  height: number;
}

/** Metadata extracted from the interacted DOM element. */
export interface ElementMeta {
  tag: string;
  text: string;
  selector: string;
  width: number;
  height: number;
}

/** Click / scroll position data. */
export interface Position {
  x: number;
  y: number;
  normalized_x: number;
  normalized_y: number;
}

/** Raw scroll data sent instead of a precomputed percentage. */
export interface ScrollData {
  scroll_y: number;
  viewport_height: number;
  doc_height: number;
}

/** The canonical event payload sent to the backend. */
export interface HeuricEvent {
  project_id: string;
  session_id: string;
  event_type: 'click' | 'scroll';
  timestamp: number;
  page_url: string;
  viewport: Viewport;
  element: ElementMeta | null;
  position: Position;
  scroll_data: ScrollData | null;
}
