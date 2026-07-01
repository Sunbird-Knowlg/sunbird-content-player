/// <reference types="vite/client" />
/**
 * Development harness — NOT production code.
 *
 * Configure via .env.local:
 *   VITE_BASE_URL=https://dev.sunbirded.org
 *   VITE_AUTH_TOKEN=Bearer eyJ...
 *   VITE_CONTENT_ID=do_11395276467516211211
 *   VITE_LANGUAGE=en
 *
 * Or via query params:
 *   ?contentId=do_31234&baseUrl=https://dev.sunbirded.org&lang=ar
 */
import { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import PlayerApp from './PlayerApp';
import { ContentService } from './services/ContentService';
import type { PlayerEventPayload } from './types';
import type { TelemetryEvent } from './telemetry/telemetry.types';

const params = new URLSearchParams(location.search);

const BASE_URL   = params.get('baseUrl')   ?? (import.meta.env.VITE_BASE_URL   as string ?? '');
const AUTH_TOKEN = params.get('authToken') ?? (import.meta.env.VITE_AUTH_TOKEN as string ?? '');
const LANG       = params.get('lang')      ?? (import.meta.env.VITE_LANGUAGE   as string ?? 'en');
const CONTENT_ID = params.get('contentId') ?? (import.meta.env.VITE_CONTENT_ID as string ?? '');

const CONTEXT = {
  uid:     params.get('uid')     ?? 'anonymous',
  sid:     params.get('sid')     ?? `session-${Date.now()}`,
  did:     params.get('did')     ?? 'device-001',
  channel: params.get('channel') ?? 'sunbird',
  pdata:   { id: 'sunbird.player.v2', pid: 'player', ver: '2.0.0' },
};

function logEntry(label: string, data: unknown) {
  console.log(`[${label}]`, data);
}

function App() {
  const [key, setKey]           = useState(0);
  const [contentId, setContentId] = useState(CONTENT_ID);
  const [lang, setLang]         = useState(LANG);

  /* One cursor per baseUrl/authToken — same as quml-demo-app environment.baseUrl */
  const cursor = useMemo(() => new ContentService(BASE_URL, AUTH_TOKEN || undefined), []);

  useEffect(() => {
    const handler = () => {
      const w = window as any;
      if (w.__sb_contentId) setContentId(w.__sb_contentId);
      if (w.__sb_lang)      setLang(w.__sb_lang);
      setKey(k => k + 1);
    };
    window.addEventListener('load-content', handler);
    return () => window.removeEventListener('load-content', handler);
  }, []);

  if (!BASE_URL || !contentId) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', fontFamily: 'system-ui', flexDirection: 'column', gap: 12, color: '#555',
      }}>
        <p style={{ fontSize: 14, fontWeight: 600 }}>Dev harness: config missing</p>
        <p style={{ fontSize: 12 }}>
          Set <code>VITE_BASE_URL</code> + <code>VITE_CONTENT_ID</code> in{' '}
          <code>player-v2/.env.local</code>
        </p>
        <code style={{ fontSize: 11, background: '#f3f4f6', padding: '6px 12px', borderRadius: 6 }}>
          ?contentId=do_31234&baseUrl=https://dev.sunbirded.org
        </code>
      </div>
    );
  }

  return (
    <PlayerApp
      key={key}
      contentId={contentId}
      context={{ ...CONTEXT, cdata: [{ id: contentId, type: 'Content' }] }}
      cursor={cursor}
      language={lang}
      onPlayerEvent={(e: PlayerEventPayload) => logEntry('player', e)}
      onTelemetryEvent={(e: TelemetryEvent) => logEntry('telemetry', { eid: e.eid, ets: e.ets })}
    />
  );
}

const root = createRoot(document.getElementById('player-root')!);
root.render(<App />);
