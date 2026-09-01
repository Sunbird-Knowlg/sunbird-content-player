import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import VideoPlugin, { VIDEO_PLUGIN_DEFINITION } from './VideoPlugin';
import { pluginProps, testRef } from '../_testUtils';

describe('VideoPlugin', () => {
  it('declares video + audio mime types', () => {
    expect(VIDEO_PLUGIN_DEFINITION.mimeTypes).toContain('video/mp4');
    expect(VIDEO_PLUGIN_DEFINITION.mimeTypes).toContain('video/webm');
    expect(VIDEO_PLUGIN_DEFINITION.mimeTypes).toContain('audio/mp3');
  });

  it('renders a <video> element for video content', () => {
    const { container } = render(
      <VideoPlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'video/mp4' } })} />
    );
    expect(container.querySelector('video')).toBeTruthy();
    expect(container.querySelector('audio')).toBeNull();
  });

  it('renders an <audio> element for audio/mp3', () => {
    const { container } = render(
      <VideoPlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'audio/mp3' } })} />
    );
    expect(container.querySelector('audio')).toBeTruthy();
    expect(container.querySelector('video')).toBeNull();
  });

  it('uses artifactUrl as the media src', () => {
    const { container } = render(
      <VideoPlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'video/mp4', artifactUrl: 'https://cdn.test/v.mp4' } })} />
    );
    expect(container.querySelector('video')?.getAttribute('src')).toBe('https://cdn.test/v.mp4');
  });

  it('prefers streamingUrl over artifactUrl when present', () => {
    const { container } = render(
      <VideoPlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'video/mp4', artifactUrl: 'a.mp4', streamingUrl: 'https://stream.test/s.m3u8' } })} />
    );
    expect(container.querySelector('video')?.getAttribute('src')).toBe('https://stream.test/s.m3u8');
  });

  it('reflects isMuted on the media element', () => {
    const { container } = render(
      <VideoPlugin ref={testRef()} {...pluginProps({ isMuted: true, contentData: { mimeType: 'video/mp4' } })} />
    );
    expect((container.querySelector('video') as HTMLVideoElement).muted).toBe(true);
  });

  it('exposes an imperative mute() that does not throw', () => {
    const ref = testRef();
    render(<VideoPlugin ref={ref} {...pluginProps({ contentData: { mimeType: 'video/mp4' } })} />);
    expect(() => ref.current?.mute(true)).not.toThrow();
  });
});
