import { describe, it, expect, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  ContentCursor,
  ContentCursorContext,
  useContentCursor,
  cursorFromWindow,
} from './ContentCursor';
import type { ContentMetaData } from '../types';

class FakeCursor extends ContentCursor {
  async getContent(id: string): Promise<ContentMetaData> {
    return { identifier: id, name: 'n', mimeType: 'application/pdf', artifactUrl: 'a.pdf' };
  }
  async sendTelemetry(): Promise<void> {}
}

function Probe() {
  const cursor = useContentCursor();
  return <span>{cursor ? 'has-cursor' : 'no-cursor'}</span>;
}

describe('ContentCursor', () => {
  afterEach(() => {
    // clean window globals used by cursorFromWindow
    delete (window as unknown as { contentBaseUrl?: string }).contentBaseUrl;
    delete (window as unknown as { contentAuthToken?: string }).contentAuthToken;
    vi.unstubAllGlobals();
  });

  it('useContentCursor returns the provided cursor from context', () => {
    render(
      <ContentCursorContext.Provider value={new FakeCursor()}>
        <Probe />
      </ContentCursorContext.Provider>
    );
    expect(screen.getByText('has-cursor')).toBeInTheDocument();
  });

  it('useContentCursor throws when no provider is present', () => {
    // suppress the expected React error boundary console noise
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ContentCursorContext not provided/);
    spy.mockRestore();
  });

  it('cursorFromWindow returns null when window.contentBaseUrl is unset', () => {
    expect(cursorFromWindow()).toBeNull();
  });

  // Note: the positive case (contentBaseUrl set) lazy-loads ContentService via
  // require(), which only resolves in the CJS/UMD build — not under the ESM test
  // runtime — so it is exercised via ContentService.test.ts instead.
});
