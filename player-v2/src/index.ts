/* ---- Components ---- */
export { default as PlayerShell } from './PlayerShell';
export type { PlayerShellProps } from './PlayerShell';
export { default as PlayerApp } from './PlayerApp';
export type { PlayerAppProps } from './PlayerApp';

/* ---- Types ---- */
export type {
  PlayerConfig, PlayerAssets, ContentMetaData, PlayerContext,
  PlayerScreen, PlayerEventPayload, TelemetryEvent,
} from './types';
export type {
  PluginDefinition, ContentPluginProps, ContentPluginRef, ProgressData,
} from './plugins/plugin.interface';

/* ---- Plugin system ---- */
export { PluginRegistry, PluginRegistryContext, usePluginRegistry } from './plugins/plugin-registry';
export { HTML_PLUGIN_DEFINITION } from './plugins/html/HtmlPlugin';
export { YOUTUBE_PLUGIN_DEFINITION } from './plugins/youtube/YoutubePlugin';
export { VIDEO_PLUGIN_DEFINITION } from './plugins/video/VideoPlugin';

/* ---- Services / cursor ---- */
export { ContentCursor, ContentCursorContext, useContentCursor } from './services/ContentCursor';
export { ContentService } from './services/ContentService';
export type { RawContentData } from './services/ContentService';
export { normalizeContent } from './services/ContentService';

/* ---- Telemetry ---- */
export { TelemetryService } from './telemetry/TelemetryService';
export { useTelemetry } from './telemetry/TelemetryContext';

/* ---- i18n ---- */
export { t, getDir, getMimeTypeLabel, formatDuration } from './i18n/i18n';

/* ---- Constants ---- */
export { COLORS, PLAYER_EVENTS, MIME_TYPES } from './constants';

/* ------------------------------------------------------------------ */
/* Vanilla JS / UMD helpers — no React knowledge needed in host        */
/* ------------------------------------------------------------------ */

import React from 'react';
import { createRoot } from 'react-dom/client';
import type { ContentCursor } from './services/ContentCursor';
import type { PlayerContext, PlayerEventPayload } from './types';
import type { TelemetryEvent } from './telemetry/telemetry.types';
import type { PluginDefinition } from './plugins/plugin.interface';

/**
 * Primary entry point.
 * Fetches content via cursor.getContent(), then renders the player.
 *
 * No server required — same pattern as quml-player demo app:
 *   cursor = new ContentService('https://dev.sunbirded.org', 'Bearer eyJ...')
 *   SunbirdPlayer.mount({ container, contentId, cursor, context, ... })
 */
export function mount(options: {
  container: HTMLElement;
  contentId: string;
  /** Omit to read from window.contentBaseUrl / window.contentAuthToken */
  cursor?: ContentCursor;
  context: PlayerContext;
  language?: string;
  plugins?: PluginDefinition[];
  onPlayerEvent?: (e: PlayerEventPayload) => void;
  onTelemetryEvent?: (e: TelemetryEvent) => void;
}): { destroy(): void } {
  const { container, ...props } = options;
  const PlayerAppComponent = require('./PlayerApp').default;
  const root = createRoot(container);
  root.render(React.createElement(PlayerAppComponent, props));
  return { destroy: () => root.unmount() };
}

/**
 * Alternative: caller already has fetched content metadata.
 * No API call made — renders immediately.
 */
export function init(options: {
  container: HTMLElement;
  playerConfig: import('./types').PlayerConfig;
  cursor?: ContentCursor;
  onPlayerEvent?: (e: PlayerEventPayload) => void;
  onTelemetryEvent?: (e: TelemetryEvent) => void;
}): { destroy(): void } {
  const { container, ...props } = options;
  const PlayerShellComponent = require('./PlayerShell').default;
  const root = createRoot(container);
  root.render(React.createElement(PlayerShellComponent, props));
  return { destroy: () => root.unmount() };
}
