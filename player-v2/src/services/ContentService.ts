/**
 * Default ContentCursor implementation — direct fetch to Sunbird APIs.
 *
 * Mirrors QuestionCursorImplementationService in quml-demo-app:
 *   environment.baseUrl = 'https://dev.sunbirded.org'
 *   GET  {baseUrl}/api/content/v1/read/{contentId}
 *   POST {baseUrl}/data/v3/telemetry
 *
 * Hosts that need to proxy through their own backend should extend
 * ContentCursor and override getContent() / sendTelemetry() instead.
 */
import { ContentCursor } from './ContentCursor';
import type { ContentMetaData } from '../types';
import type { TelemetryEvent } from '../telemetry/telemetry.types';

export interface RawContentData {
  identifier: string;
  name: string;
  mimeType: string;
  artifactUrl: string;
  streamingUrl?: string;
  downloadUrl?: string;
  pkgVersion?: number;
  duration?: number | string;
  subject?: string | string[];
  gradeLevel?: string[];
  thumbnail?: string;
  appIcon?: string;
  posterImage?: string;
  baseDir?: string;
  /** SCORM multi-SCO manifest — string (JSON) or parsed array */
  scoList?: string | Array<{ identifier: string; title?: string; href: string }>;
  /** SCORM single-SCO entry-point relative path */
  launchFile?: string;
  [key: string]: unknown;
}

function parseDuration(raw: unknown): number | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const iso = raw.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (iso) return (Number(iso[1] ?? 0) * 3600) + (Number(iso[2] ?? 0) * 60) + Number(iso[3] ?? 0);
    const n = Number(raw);
    return isNaN(n) ? undefined : n;
  }
  return undefined;
}

/**
 * Sunbird API sometimes returns arrays as stringified Python lists:
 *   "['Hindi']"  or  "['Class 2']"
 * Parse those back to real arrays.
 */
function parseStringifiedArray(val: unknown): string[] | undefined {
  if (!val) return undefined;
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === 'string') {
    /* "['Hindi', 'English']" → ['Hindi', 'English'] */
    const m = val.match(/\[([^\]]*)\]/);
    if (m) {
      return m[1]
        .split(',')
        .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    }
    return val ? [val] : undefined;
  }
  return undefined;
}

export function normalizeContent(raw: RawContentData): ContentMetaData {
  const subjects = parseStringifiedArray(raw.subject);
  const grades   = parseStringifiedArray(raw.gradeLevel);
  /* Parse scoList — may arrive as JSON string or already an array */
  let scoList: Array<{ identifier: string; title?: string; href: string }> | undefined;
  if (raw.scoList) {
    try {
      scoList = typeof raw.scoList === 'string' ? JSON.parse(raw.scoList) : raw.scoList as typeof scoList;
    } catch { scoList = undefined; }
  }

  return {
    identifier:   raw.identifier,
    name:         raw.name,
    mimeType:     raw.mimeType,
    artifactUrl:  raw.artifactUrl ?? raw.downloadUrl ?? '',
    streamingUrl: raw.streamingUrl,
    pkgVersion:   raw.pkgVersion,
    duration:     parseDuration(raw.duration),
    subject:      subjects?.join(', '),
    gradeLevel:   grades,
    thumbnail:    raw.thumbnail ?? raw.appIcon ?? raw.posterImage,
    baseDir:      raw.baseDir,
    scoList,
    launchFile:   raw.launchFile ? String(raw.launchFile) : undefined,
  };
}

export class ContentService extends ContentCursor {
  private baseUrl: string;
  private headers: Record<string, string>;
  private telemetryUrl: string;

  /**
   * @param baseUrl          e.g. 'https://dev.sunbirded.org'  (no trailing slash)
   * @param authToken        e.g. 'Bearer eyJ...'
   * @param telemetryUrl     override telemetry endpoint (default: {baseUrl}/data/v3/telemetry)
   */
  constructor(baseUrl: string, authToken?: string, telemetryUrl?: string) {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.telemetryUrl = telemetryUrl ?? `${this.baseUrl}/data/v3/telemetry`;
    this.headers = {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: authToken } : {}),
    };
  }

  /**
   * GET {baseUrl}/api/content/v1/read/{contentId}
   * Same endpoint as quml-demo-app ApiEndPoints.getContent
   */
  async getContent(contentId: string): Promise<ContentMetaData> {
    const fields = [
      'name', 'mimeType', 'artifactUrl', 'streamingUrl', 'downloadUrl',
      'pkgVersion', 'duration', 'subject', 'gradeLevel', 'thumbnail',
      'appIcon', 'posterImage', 'baseDir',
    ].join(',');

    const url = `${this.baseUrl}/api/content/v1/read/${encodeURIComponent(contentId)}?fields=${fields}`;
    const resp = await fetch(url, { headers: this.headers });

    if (!resp.ok) {
      throw new Error(`Content API ${resp.status} for id=${contentId}`);
    }
    const data = await resp.json();
    if (data.responseCode !== 'OK' && data.responseCode !== 'ok') {
      throw new Error(`Content API responseCode=${data.responseCode}`);
    }
    return normalizeContent(data.result.content as RawContentData);
  }

  /**
   * POST {baseUrl}/data/v3/telemetry
   * Same endpoint as Sunbird portal telemetry dispatcher
   */
  async sendTelemetry(events: TelemetryEvent[]): Promise<void> {
    await fetch(this.telemetryUrl, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        id: 'api.telemetry',
        ver: '1.0',
        ts: new Date().toISOString(),
        events,
      }),
    });
  }
}
