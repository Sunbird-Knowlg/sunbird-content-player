import React from 'react';
import type { ContentPluginProps } from './plugin.interface';
import type { ContentMetaData } from '../types';

/** Minimal ContentPluginProps for smoke-rendering a plugin in tests. */
export function pluginProps(
  overrides: Omit<Partial<ContentPluginProps>, 'contentData'> & { contentData?: Partial<ContentMetaData> } = {}
): ContentPluginProps {
  const { contentData, ...rest } = overrides;
  return {
    contentData: {
      identifier: 'do_test',
      name: 'Test Content',
      mimeType: 'application/octet-stream',
      artifactUrl: 'https://example.test/file',
      ...contentData,
    },
    isMuted: false,
    language: 'en',
    dir: 'ltr',
    onReady: () => {},
    onFinished: () => {},
    onError: () => {},
    onProgress: () => {},
    onInteract: () => {},
    onReplay: () => {},
    onExit: () => {},
    onMuteToggle: () => {},
    ...rest,
  };
}

/** A React ref usable as the plugin's forwarded ref. */
export const testRef = () => React.createRef<import('./plugin.interface').ContentPluginRef>();
