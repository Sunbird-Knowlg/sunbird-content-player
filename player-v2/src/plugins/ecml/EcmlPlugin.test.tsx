import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EcmlPlugin, { ECML_PLUGIN_DEFINITION } from './EcmlPlugin';
import { pluginProps, testRef } from '../_testUtils';

describe('EcmlPlugin', () => {
  it('declares the ecml-archive mime type', () => {
    expect(ECML_PLUGIN_DEFINITION.mimeTypes).toContain('application/vnd.ekstep.ecml-archive');
  });

  it('exposes a component in its definition', () => {
    expect(ECML_PLUGIN_DEFINITION.component).toBeTruthy();
  });

  it('shows the loading state on mount', () => {
    render(<EcmlPlugin ref={testRef()} {...pluginProps({ contentData: { mimeType: 'application/vnd.ekstep.ecml-archive' } })} />);
    expect(screen.getByText(/loading content/i)).toBeInTheDocument();
  });

  it('reports an error when the body cannot be loaded', async () => {
    // no inline body + a URL fetch that fails in jsdom → onError
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const onError = vi.fn();
    render(
      <EcmlPlugin
        ref={testRef()}
        {...pluginProps({ onError, contentData: { mimeType: 'application/vnd.ekstep.ecml-archive', artifactUrl: 'https://x.test/body.json' } })}
      />
    );
    await waitFor(() => expect(onError).toHaveBeenCalled());
    vi.unstubAllGlobals();
  });
});
