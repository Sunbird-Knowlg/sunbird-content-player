import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import YoutubePlugin, { YOUTUBE_PLUGIN_DEFINITION } from './YoutubePlugin';
import { pluginProps, testRef } from '../_testUtils';

describe('YoutubePlugin', () => {
  it('declares the youtube mime type', () => {
    expect(YOUTUBE_PLUGIN_DEFINITION.mimeTypes).toContain('video/x-youtube');
  });

  it('exposes a component in its definition', () => {
    expect(YOUTUBE_PLUGIN_DEFINITION.component).toBeTruthy();
  });

  it('mounts with a youtu.be short URL', () => {
    const { container } = render(
      <YoutubePlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'video/x-youtube', artifactUrl: 'https://youtu.be/abc123' } })} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('mounts with a watch?v= URL', () => {
    const { container } = render(
      <YoutubePlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'video/x-youtube', artifactUrl: 'https://www.youtube.com/watch?v=abc123' } })} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('does not crash with an empty artifactUrl', () => {
    expect(() =>
      render(<YoutubePlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'video/x-youtube', artifactUrl: '' } })} />)
    ).not.toThrow();
  });
});
