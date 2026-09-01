import type { PluginDefinition } from './plugins/plugin.interface';

export interface ScoItem {
  identifier: string;
  title?: string;
  href: string;
}

export interface ContentMetaData {
  identifier: string;
  name: string;
  mimeType: string;
  artifactUrl: string;
  pkgVersion?: number;
  /** seconds */
  duration?: number;
  subject?: string;
  gradeLevel?: string[];
  thumbnail?: string;
  streamingUrl?: string;
  baseDir?: string;
  /** SCORM multi-SCO list */
  scoList?: ScoItem[];
  /** SCORM single-SCO launch file (relative path inside the package) */
  launchFile?: string;
  /** Inline ECML body — populated by content read API for ecml-archive content */
  body?: unknown;
  /**
   * Set by mobile/offline resolver when content is downloaded locally.
   * Capacitor webview URL of the content directory (e.g. https://localhost/_capacitor_file_/…/do_xxx/).
   * PDF/EPUB plugins use this + artifactUrl (basename) to build the full local URL.
   */
  basePath?: string;
  /** True when content has been downloaded and basePath points to local storage. */
  isAvailableLocally?: boolean;
}

export interface PlayerContext {
  uid: string;
  sid: string;
  did: string;
  channel: string;
  pdata: { id: string; pid: string; ver: string };
  cdata?: Array<{ id: string; type: string }>;
  rollup?: Record<string, string>;
}

export interface TelemetryConfig {
  /** Optional direct POST endpoint; if absent events are only emitted via onTelemetryEvent */
  url?: string;
  batchSize?: number;
  /** Milliseconds between heartbeat events while playing (default 30000) */
  heartbeatInterval?: number;
}

/**
 * Local asset paths for offline-capable deployments (e.g. mobile app).
 * When provided, plugins load their renderer libraries from these paths
 * instead of the default CDN URLs.
 */
export interface PlayerAssets {
  /** Path to pdf.min.js (PDF.js main script). Default: CDN */
  pdfjsScript?: string;
  /** Path to pdf.worker.min.js. Default: CDN */
  pdfjsWorker?: string;
  /** Path to jszip.min.js (required by epub.js). Default: CDN */
  jszipScript?: string;
  /** Path to epub.min.js (epub.js). Default: CDN */
  epubjsScript?: string;
}

export interface PlayerConfig {
  metadata: ContentMetaData;
  context: PlayerContext;
  config?: {
    /** BCP-47 language code, default 'en' */
    language?: string;
    telemetry?: TelemetryConfig;
    /** Caller-registered extra plugins — registered before built-ins, so built-ins take precedence */
    plugins?: PluginDefinition[];
    /**
     * Override asset paths for offline environments (e.g. Capacitor mobile app).
     * If omitted, plugins load from their default CDN URLs.
     */
    assets?: PlayerAssets;
    /**
     * Set false to hide the ⋮ menu button for all content types.
     * Default: true (menu shown).
     */
    menuBar?: boolean;
    /**
     * Initial controls bar position for PDF / EPUB content.
     * Replaces the in-menu "Controls position" picker.
     * 'top' → top bar  |  'bottom' → bottom bar  |  'default' (or omitted) → floating default
     */
    controlsLocation?: 'top' | 'bottom' | 'default';
    /**
     * Show the "Download" menu item for downloadable content (PDF / EPUB).
     * Default: true. Set false to hide it (e.g. when the portal disallows download).
     */
    downloadContent?: boolean;
  };
}

export type PlayerScreen = 'start' | 'loading' | 'playing' | 'finished';

export interface PlayerState {
  screen: PlayerScreen;
  isMuted: boolean;
  loadingProgress: number;
}

export interface PlayerEventPayload {
  eid: string;
  edata?: Record<string, unknown>;
  ts?: number;
}

export interface TelemetryEvent {
  eid: string;
  ets: number;
  ver: string;
  mid: string;
  actor: { id: string; type: string };
  context: {
    channel: string;
    pdata: { id: string; pid: string; ver: string };
    env: string;
    sid: string;
    did: string;
    cdata?: Array<{ id: string; type: string }>;
    rollup?: Record<string, string>;
  };
  object: { id: string; type: string; ver?: string; rollup?: Record<string, string> };
  edata: Record<string, unknown>;
  tags?: string[];
}
