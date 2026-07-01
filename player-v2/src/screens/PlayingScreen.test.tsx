import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import PlayingScreen from './PlayingScreen';
import type { ContentMetaData } from '../types';
import type { ContentPluginRef } from '../plugins/plugin.interface';

const noop = () => {};

function renderPlaying(over: Partial<ContentMetaData> = {}, props: Record<string, unknown> = {}) {
  const metadata: ContentMetaData = {
    identifier: 'do_1', name: 'X', mimeType: 'application/pdf', artifactUrl: 'a.pdf', ...over,
  };
  return render(
    <PlayingScreen
      metadata={metadata}
      isMuted={false}
      language="en"
      dir="ltr"
      pluginRef={React.createRef<ContentPluginRef>()}
      onReady={noop}
      onFinished={noop}
      onReplay={noop}
      onMuteToggle={noop}
      onExit={noop}
      onError={noop}
      onProgress={noop}
      onInteract={vi.fn()}
      {...props}
    />
  );
}

describe('PlayingScreen', () => {
  it('renders the playing area wrapper', () => {
    const { container } = renderPlaying();
    expect(container.querySelector('.sp-playing-area')).toBeTruthy();
  });

  it('falls back to the generic plugin for an unmapped mime type', () => {
    // no PluginRegistryContext provider → empty registry → GenericPlugin
    const { getByText } = renderPlaying({ mimeType: 'application/x-unknown' });
    expect(getByText(/not supported/i)).toBeInTheDocument();
  });

  it('shows the shell menu button for a plain HTML type when menuBar is on', () => {
    const { container } = renderPlaying({ mimeType: 'application/vnd.ekstep.html-archive' });
    expect(container.querySelector('.sp-menu-btn')).toBeTruthy();
  });

  it('hides the shell menu button when menuBar is false', () => {
    const { container } = renderPlaying({ mimeType: 'application/vnd.ekstep.html-archive' }, { menuBar: false });
    expect(container.querySelector('.sp-menu-btn')).toBeNull();
  });
});
