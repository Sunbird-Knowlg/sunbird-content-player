/**
 * Abstract content cursor — mirrors QuestionCursor in quml-player.
 *
 * The library defines the contract; the host app provides the implementation.
 * Player never contains a hardcoded URL — the host decides how to call APIs.
 *
 * Three usage patterns (same hierarchy as quml-player web component):
 *
 * 1. React / npm package — pass cursor prop:
 *      const cursor = new ContentService('https://dev.sunbirded.org');
 *      <PlayerApp contentId="do_123" cursor={cursor} ... />
 *
 * 2. Vanilla JS / web component — set window globals before mounting
 *    (identical to quml-player's window.questionListUrl pattern):
 *      window.contentBaseUrl   = 'https://dev.sunbirded.org';
 *      window.contentAuthToken = 'Bearer eyJ...';
 *      SunbirdPlayer.mount({ container, contentId, context });
 *      // ContentService auto-constructed from window globals
 *
 * 3. Custom backend (proxied) — subclass ContentCursor:
 *      class MyCursor extends ContentCursor {
 *        async getContent(id) { return fetch(`/proxy/content/${id}`).then(r=>r.json()); }
 *        async sendTelemetry(events) { fetch('/proxy/telemetry', { method:'POST', body:JSON.stringify(events) }); }
 *      }
 */
import type { ContentMetaData } from '../types';
import type { TelemetryEvent } from '../telemetry/telemetry.types';
import React from 'react';

export abstract class ContentCursor {
  abstract getContent(identifier: string): Promise<ContentMetaData>;
  abstract sendTelemetry(events: TelemetryEvent[]): Promise<void>;
}

/**
 * Reads URL from window globals — same as quml-player WC reading
 * window.questionListUrl from document.defaultView.
 *
 * Parent page sets:
 *   window.contentBaseUrl   = 'https://dev.sunbirded.org';
 *   window.contentAuthToken = 'Bearer eyJ...';  // optional
 *
 * Returns null if window.contentBaseUrl is not set.
 */
export function cursorFromWindow(): ContentCursor | null {
  const w = (typeof window !== 'undefined' ? window : {}) as any;
  const baseUrl = w.contentBaseUrl;
  if (!baseUrl) return null;
  const { ContentService } = require('./ContentService');
  return new ContentService(baseUrl, w.contentAuthToken);
}

export const ContentCursorContext = React.createContext<ContentCursor | null>(null);

export function useContentCursor(): ContentCursor {
  const cursor = React.useContext(ContentCursorContext);
  if (!cursor) throw new Error('ContentCursorContext not provided — pass cursor prop to PlayerApp');
  return cursor;
}
