import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ContentService, normalizeContent, type RawContentData } from './ContentService';

describe('normalizeContent', () => {
  it('maps core fields and falls back artifactUrl → downloadUrl', () => {
    const raw = { identifier: 'do_1', name: 'X', mimeType: 'application/pdf', downloadUrl: 'd.pdf' } as RawContentData;
    const c = normalizeContent(raw);
    expect(c.identifier).toBe('do_1');
    expect(c.artifactUrl).toBe('d.pdf');
  });

  it('parses ISO-8601 duration', () => {
    const c = normalizeContent({ duration: 'PT1H2M3S' } as unknown as RawContentData);
    expect(c.duration).toBe(3723);
  });

  it('parses numeric-string duration', () => {
    const c = normalizeContent({ duration: '90' } as unknown as RawContentData);
    expect(c.duration).toBe(90);
  });

  it('parses stringified-python-list arrays', () => {
    const c = normalizeContent({ gradeLevel: "['Class 1', 'Class 2']" } as unknown as RawContentData);
    expect(c.gradeLevel).toEqual(['Class 1', 'Class 2']);
  });

  it('joins subject array to a string', () => {
    const c = normalizeContent({ subject: ['Math', 'Science'] } as unknown as RawContentData);
    expect(c.subject).toBe('Math, Science');
  });

  it('parses scoList JSON string, tolerates bad JSON', () => {
    const ok = normalizeContent({ scoList: '[{"identifier":"s1","href":"a.html"}]' } as unknown as RawContentData);
    expect(ok.scoList).toEqual([{ identifier: 's1', href: 'a.html' }]);
    const bad = normalizeContent({ scoList: 'not-json' } as unknown as RawContentData);
    expect(bad.scoList).toBeUndefined();
  });
});

describe('ContentService', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('getContent hits the read endpoint and normalizes the result', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ responseCode: 'OK', result: { content: { identifier: 'do_9', name: 'N', mimeType: 'application/pdf', artifactUrl: 'a.pdf' } } }),
    });
    const svc = new ContentService('https://host/', 'Bearer t');
    const c = await svc.getContent('do_9');
    expect(c.name).toBe('N');
    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/api/content/v1/read/do_9');
  });

  it('getContent throws on non-ok HTTP', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    const svc = new ContentService('https://host');
    await expect(svc.getContent('do_x')).rejects.toThrow(/500/);
  });

  it('sendTelemetry POSTs an events envelope', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, json: async () => ({}) });
    const svc = new ContentService('https://host');
    await svc.sendTelemetry([{ eid: 'START' } as never]);
    const [, opts] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body).events).toHaveLength(1);
  });
});
