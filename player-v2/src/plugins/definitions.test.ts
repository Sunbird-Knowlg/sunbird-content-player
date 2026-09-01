import { describe, it, expect } from 'vitest';
import {
  HTML_PLUGIN_DEFINITION,
  YOUTUBE_PLUGIN_DEFINITION,
  VIDEO_PLUGIN_DEFINITION,
  PDF_PLUGIN_DEFINITION,
  EPUB_PLUGIN_DEFINITION,
  ECML_PLUGIN_DEFINITION,
} from './index';
import { PluginRegistry } from './plugin-registry';

const ALL = [
  HTML_PLUGIN_DEFINITION,
  YOUTUBE_PLUGIN_DEFINITION,
  VIDEO_PLUGIN_DEFINITION,
  PDF_PLUGIN_DEFINITION,
  EPUB_PLUGIN_DEFINITION,
  ECML_PLUGIN_DEFINITION,
];

describe('plugin definitions', () => {
  it('every definition exposes mimeTypes and a component', () => {
    for (const def of ALL) {
      expect(Array.isArray(def.mimeTypes)).toBe(true);
      expect(def.mimeTypes.length).toBeGreaterThan(0);
      expect(def.component).toBeTruthy();
    }
  });

  it('resolves the expected mimeTypes when all are registered', () => {
    const reg = new PluginRegistry();
    ALL.forEach(d => reg.register(d));
    expect(reg.resolve('application/pdf')).toBe(PDF_PLUGIN_DEFINITION);
    expect(reg.resolve('video/mp4')).toBe(VIDEO_PLUGIN_DEFINITION);
    expect(reg.resolve('video/x-youtube')).toBe(YOUTUBE_PLUGIN_DEFINITION);
    expect(reg.resolve('application/vnd.ekstep.ecml-archive')).toBe(ECML_PLUGIN_DEFINITION);
    expect(reg.resolve('application/epub')).toBe(EPUB_PLUGIN_DEFINITION);
  });

  it('has no duplicate mimeType across different plugins', () => {
    const seen = new Map<string, unknown>();
    for (const def of ALL) {
      for (const mt of def.mimeTypes) {
        // same mimeType must not be claimed by two different definitions
        if (seen.has(mt)) expect(seen.get(mt)).toBe(def);
        seen.set(mt, def);
      }
    }
  });
});
