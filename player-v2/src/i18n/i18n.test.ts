import { describe, it, expect } from 'vitest';
import { t, getDir, getTranslations, getMimeTypeLabel, formatDuration } from './i18n';

describe('i18n', () => {
  it('returns the English value for a known key', () => {
    expect(t('en', 'REPLAY')).toBe('Replay');
  });

  it('falls back to English for an unknown language', () => {
    expect(t('xx', 'EXIT')).toBe('Exit');
  });

  it('returns the key itself for an unknown key', () => {
    expect(t('en', 'NON_EXISTENT_KEY')).toBe('NON_EXISTENT_KEY');
  });

  it('returns a localized value when available', () => {
    // hi has its own translations; the value should differ from the key at least
    expect(t('hi', 'REPLAY')).not.toBe('REPLAY');
  });

  it('getDir reports rtl for Arabic and ltr otherwise', () => {
    expect(getDir('ar')).toBe('rtl');
    expect(getDir('ur')).toBe('rtl');
    expect(getDir('en')).toBe('ltr');
    expect(getDir('hi')).toBe('ltr');
  });

  it('getTranslations merges English defaults under the target language', () => {
    const table = getTranslations('fr');
    // every English key is present (merged fallback)
    expect(Object.keys(table)).toContain('EXIT');
  });

  it('getMimeTypeLabel maps known mimeTypes and defaults unknown', () => {
    expect(getMimeTypeLabel('en', 'application/pdf')).toBe('PDF');
    expect(getMimeTypeLabel('en', 'application/unknown')).toBe(t('en', 'TYPE_UNKNOWN'));
  });

  it('formatDuration formats minutes and handles empty', () => {
    expect(formatDuration('en', 120)).toBe('2 min');
    expect(formatDuration('en', undefined)).toBe('');
    expect(formatDuration('en', 0)).toBe('');
  });
});
