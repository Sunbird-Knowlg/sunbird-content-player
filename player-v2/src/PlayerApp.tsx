/**
 * PlayerApp — production entry point.
 *
 * Mirrors the quml-demo-app pattern exactly:
 *   1. Host creates a ContentCursor (or uses the default ContentService)
 *   2. Passes cursor + contentId to PlayerApp
 *   3. PlayerApp calls cursor.getContent(contentId) — one API call, no server
 *   4. On flush/end, cursor.sendTelemetry(events) — POST to Sunbird telemetry API
 *
 * Usage with default ContentService (direct Sunbird API, same as quml-demo-app):
 *
 *   import { PlayerApp, ContentService } from '@sunbird/content-player';
 *
 *   const cursor = new ContentService('https://dev.sunbirded.org', 'Bearer eyJ...');
 *   <PlayerApp
 *     contentId="do_31234"
 *     context={{ uid, sid, did, channel, pdata }}
 *     cursor={cursor}
 *     language="en"
 *     onPlayerEvent={handler}
 *     onTelemetryEvent={handler}
 *   />
 *
 * Usage with custom cursor (proxied through your backend):
 *
 *   class MyContentCursor extends ContentCursor {
 *     async getContent(id) {
 *       const res = await fetch(`/my-server/content/${id}`);
 *       return (await res.json()).metadata;
 *     }
 *     async sendTelemetry(events) {
 *       await fetch('/my-server/telemetry', {
 *         method: 'POST', body: JSON.stringify(events),
 *       });
 *     }
 *   }
 *   <PlayerApp contentId="do_31234" cursor={new MyContentCursor()} context={...} />
 */
import React from 'react';
import './player.css';

import PlayerShell from './PlayerShell';
import LoadingScreen from './screens/LoadingScreen';
import { cursorFromWindow } from './services/ContentCursor';
import type { ContentCursor } from './services/ContentCursor';
import type { ContentMetaData, PlayerContext, PlayerEventPayload } from './types';
import type { TelemetryEvent } from './telemetry/telemetry.types';
import type { PluginDefinition } from './plugins/plugin.interface';
import { COLORS, FONT_FAMILY } from './constants';

export interface PlayerAppProps {
  /** Sunbird content identifier, e.g. "do_31234" */
  contentId: string;
  /** Sunbird player context (user, session, device, channel) */
  context: PlayerContext;
  /**
   * ContentCursor implementation.
   * - Pass ContentService for direct Sunbird API calls.
   * - Omit when using vanilla JS / web component — cursor auto-read from
   *   window.contentBaseUrl (same as quml-player's window.questionListUrl).
   */
  cursor?: ContentCursor;
  /** BCP-47 language code, default 'en' */
  language?: string;
  /** Additional plugins to register beyond built-ins */
  plugins?: PluginDefinition[];
  onPlayerEvent?(event: PlayerEventPayload): void;
  onTelemetryEvent?(event: TelemetryEvent): void;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; metadata: ContentMetaData };

const PlayerApp: React.FC<PlayerAppProps> = ({
  contentId,
  context,
  cursor: cursorProp,
  language = 'en',
  plugins,
  onPlayerEvent,
  onTelemetryEvent,
}) => {
  /* Resolve cursor: explicit prop → window globals → error */
  const cursor = cursorProp ?? cursorFromWindow();

  const [state, setState] = React.useState<LoadState>({ status: 'loading' });

  React.useEffect(() => {
    if (!cursor) {
      setState({ status: 'error', message: 'No cursor provided. Set cursor prop or window.contentBaseUrl.' });
      return;
    }
    setState({ status: 'loading' });
    cursor.getContent(contentId)
      .then(metadata => setState({ status: 'ready', metadata }))
      .catch(err => setState({ status: 'error', message: String(err?.message ?? err) }));
  }, [contentId, cursor]);

  if (state.status === 'loading') {
    /* Phase 1: API call in-flight — no title yet, show generic loading */
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <LoadingScreen language={language} progress={5} />
      </div>
    );
  }

  if (state.status === 'error') {
    return <ErrorScreen message={state.message} language={language} />;
  }

  return (
    <PlayerShell
      playerConfig={{
        metadata: state.metadata,
        context,
        config: { language, plugins },
      }}
      cursor={cursor ?? undefined}
      onPlayerEvent={onPlayerEvent}
      onTelemetryEvent={onTelemetryEvent}
    />
  );
};

const ErrorScreen: React.FC<{ message: string; language: string }> = ({ message }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%', height: '100%', background: COLORS.ivory,
    fontFamily: FONT_FAMILY, flexDirection: 'column', gap: 8, padding: 24, textAlign: 'center',
  }}>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
      stroke={COLORS.brick} strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <p style={{ fontSize: 17, fontWeight: 600, color: COLORS.obsidian, fontFamily: FONT_FAMILY }}>Failed to load content</p>
    <p style={{ fontSize: 14, color: COLORS.gray500, maxWidth: 300, lineHeight: 1.5, fontFamily: FONT_FAMILY }}>{message}</p>
  </div>
);

export default PlayerApp;
