import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import HtmlPlugin, { HTML_PLUGIN_DEFINITION } from './HtmlPlugin';
import { pluginProps, testRef } from '../_testUtils';

describe('HtmlPlugin', () => {
  it('declares html / h5p / scorm mime types', () => {
    expect(HTML_PLUGIN_DEFINITION.mimeTypes).toEqual(
      expect.arrayContaining([
        'application/vnd.ekstep.html-archive',
        'application/vnd.ekstep.h5p-archive',
        'application/vnd.ekstep.scorm-archive',
      ])
    );
  });

  it('mounts for an HTML archive', () => {
    const { container } = render(
      <HtmlPlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'application/vnd.ekstep.html-archive' } })} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('mounts for an H5P archive', () => {
    const { container } = render(
      <HtmlPlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'application/vnd.ekstep.h5p-archive' } })} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('mounts for a SCORM archive', () => {
    const { container } = render(
      <HtmlPlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'application/vnd.ekstep.scorm-archive' } })} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('does not crash with menuBar disabled', () => {
    expect(() =>
      render(<HtmlPlugin ref={testRef()} {...pluginProps({ menuBar: false, contentData: { mimeType: 'application/vnd.ekstep.html-archive' } })} />)
    ).not.toThrow();
  });
});
