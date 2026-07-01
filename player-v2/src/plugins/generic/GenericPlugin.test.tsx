import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import GenericPlugin from './GenericPlugin';
import { t } from '../../i18n/i18n';
import type { ContentMetaData } from '../../types';

const metadata: ContentMetaData = {
  identifier: 'do_1', name: 'X', mimeType: 'application/zip', artifactUrl: 'a.zip',
};

function renderGeneric(language = 'en', onReady = vi.fn()) {
  render(
    <GenericPlugin
      ref={React.createRef()}
      contentData={metadata}
      isMuted={false}
      language={language}
      dir="ltr"
      onReady={onReady}
      onFinished={() => {}}
    />
  );
  return onReady;
}

describe('GenericPlugin', () => {
  it('calls onReady exactly once on mount', () => {
    const onReady = renderGeneric();
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('shows the unsupported title and subtitle', () => {
    renderGeneric();
    expect(screen.getByText(t('en', 'UNSUPPORTED'))).toBeInTheDocument();
    expect(screen.getByText(t('en', 'UNSUPPORTED_SUB'))).toBeInTheDocument();
  });

  it('localizes the message for another language', () => {
    renderGeneric('hi');
    expect(screen.getByText(t('hi', 'UNSUPPORTED'))).toBeInTheDocument();
  });
});
