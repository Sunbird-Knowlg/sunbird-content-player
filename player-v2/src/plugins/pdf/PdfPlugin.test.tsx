import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PdfPlugin, { PDF_PLUGIN_DEFINITION } from './PdfPlugin';
import { pluginProps, testRef } from '../_testUtils';

describe('PdfPlugin', () => {
  it('declares the pdf mime type', () => {
    expect(PDF_PLUGIN_DEFINITION.mimeTypes).toContain('application/pdf');
  });

  it('exposes a component in its definition', () => {
    expect(PDF_PLUGIN_DEFINITION.component).toBeTruthy();
  });

  it('shows the loading state on mount (pdf.js unavailable in jsdom)', () => {
    render(<PdfPlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'application/pdf' } })} />);
    expect(screen.getByText(/loading document/i)).toBeInTheDocument();
  });

  it('still mounts (loading) when menuBar is disabled', () => {
    render(<PdfPlugin ref={testRef()} {...pluginProps({ menuBar: false, contentData: { mimeType: 'application/pdf' } })} />);
    expect(screen.getByText(/loading document/i)).toBeInTheDocument();
  });

  it('does not crash when downloadContent is false', () => {
    expect(() =>
      render(<PdfPlugin ref={testRef()} {...pluginProps({ downloadContent: false, contentData: { mimeType: 'application/pdf' } })} />)
    ).not.toThrow();
  });
});
