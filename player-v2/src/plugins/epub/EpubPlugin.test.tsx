import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EpubPlugin, { EPUB_PLUGIN_DEFINITION } from './EpubPlugin';
import { pluginProps, testRef } from '../_testUtils';

describe('EpubPlugin', () => {
  it('declares epub mime types', () => {
    expect(EPUB_PLUGIN_DEFINITION.mimeTypes).toContain('application/epub');
    expect(EPUB_PLUGIN_DEFINITION.mimeTypes).toContain('application/epub+zip');
  });

  it('exposes a component in its definition', () => {
    expect(EPUB_PLUGIN_DEFINITION.component).toBeTruthy();
  });

  it('shows the loading overlay on mount (epub.js unavailable in jsdom)', () => {
    render(<EpubPlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'application/epub' } })} />);
    expect(screen.getByText(/loading epub/i)).toBeInTheDocument();
  });

  it('mounts for the epub+zip mime type', () => {
    const { container } = render(
      <EpubPlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'application/epub+zip' } })} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('does not crash when downloadContent is false', () => {
    expect(() =>
      render(<EpubPlugin ref={testRef()} {...pluginProps({ downloadContent: false, contentData: { mimeType: 'application/epub' } })} />)
    ).not.toThrow();
  });
});
