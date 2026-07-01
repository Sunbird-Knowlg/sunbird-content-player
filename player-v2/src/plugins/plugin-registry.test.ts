import { describe, it, expect } from 'vitest';
import { PluginRegistry } from './plugin-registry';
import type { PluginDefinition } from './plugin.interface';

const fakeDef = (mimeTypes: string[]): PluginDefinition => ({
  mimeTypes,
  component: (() => null) as unknown as PluginDefinition['component'],
});

describe('PluginRegistry', () => {
  it('registers and resolves by mimeType (case-insensitive)', () => {
    const reg = new PluginRegistry();
    const def = fakeDef(['application/pdf']);
    reg.register(def);
    expect(reg.resolve('application/pdf')).toBe(def);
    expect(reg.resolve('APPLICATION/PDF')).toBe(def);
  });

  it('returns undefined for unknown mimeType', () => {
    const reg = new PluginRegistry();
    expect(reg.resolve('application/unknown')).toBeUndefined();
  });

  it('supports multiple mimeTypes per definition', () => {
    const reg = new PluginRegistry();
    const def = fakeDef(['video/mp4', 'video/webm']);
    reg.register(def);
    expect(reg.resolve('video/mp4')).toBe(def);
    expect(reg.resolve('video/webm')).toBe(def);
    expect(reg.registeredTypes).toEqual(expect.arrayContaining(['video/mp4', 'video/webm']));
  });

  it('later registration overrides an earlier one for the same mimeType', () => {
    const reg = new PluginRegistry();
    const a = fakeDef(['text/html']);
    const b = fakeDef(['text/html']);
    reg.register(a);
    reg.register(b);
    expect(reg.resolve('text/html')).toBe(b);
  });
});
