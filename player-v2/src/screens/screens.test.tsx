import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EndScreen from './EndScreen';
import LoadingScreen from './LoadingScreen';
import StartScreen from './StartScreen';
import type { ContentMetaData } from '../types';

const metadata: ContentMetaData = {
  identifier: 'do_1', name: 'My Content', mimeType: 'application/pdf', artifactUrl: 'a.pdf', duration: 120,
};

describe('EndScreen', () => {
  it('renders the completion heading and content title', () => {
    render(<EndScreen title="My Content" language="en" timeSpentSec={65} onReplay={() => {}} onDone={() => {}} />);
    expect(screen.getByText('You just completed')).toBeInTheDocument();
    expect(screen.getByText('My Content')).toBeInTheDocument();
  });

  it('shows the formatted time when timeSpentSec > 0', () => {
    render(<EndScreen title="X" language="en" timeSpentSec={65} onReplay={() => {}} onDone={() => {}} />);
    expect(screen.getByText('01:05')).toBeInTheDocument();
  });

  it('hides the time card when timeSpentSec is 0', () => {
    render(<EndScreen title="X" language="en" timeSpentSec={0} onReplay={() => {}} onDone={() => {}} />);
    expect(screen.queryByText('TIME')).toBeNull();
  });

  it('fires onReplay and onDone', () => {
    const onReplay = vi.fn();
    const onDone = vi.fn();
    render(<EndScreen title="X" language="en" timeSpentSec={10} onReplay={onReplay} onDone={onDone} />);
    fireEvent.click(screen.getByText(/replay/i));
    fireEvent.click(screen.getByText(/exit/i));
    expect(onReplay).toHaveBeenCalled();
    expect(onDone).toHaveBeenCalled();
  });
});

describe('LoadingScreen', () => {
  it('renders the loading progress percentage and title', () => {
    render(<LoadingScreen title="My Content" language="en" progress={42} />);
    expect(screen.getByText(/42%/)).toBeInTheDocument();
    expect(screen.getByText('My Content')).toBeInTheDocument();
  });

  it('clamps progress above 100 to 100%', () => {
    render(<LoadingScreen title="X" language="en" progress={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('exposes an ARIA progressbar', () => {
    const { container } = render(<LoadingScreen language="en" progress={30} />);
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-valuenow')).toBe('30');
  });
});

describe('StartScreen', () => {
  it('renders content name, type badge and fires onStart', () => {
    const onStart = vi.fn();
    render(<StartScreen metadata={metadata} language="en" onStart={onStart} />);
    expect(screen.getByText('My Content')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/start/i));
    expect(onStart).toHaveBeenCalled();
  });

  it('shows a formatted duration in the meta line', () => {
    render(<StartScreen metadata={metadata} language="en" onStart={() => {}} />);
    expect(screen.getByText(/2 min/)).toBeInTheDocument();
  });

  it('renders without a meta line when no duration/grade/subject', () => {
    const bare: ContentMetaData = { identifier: 'do_2', name: 'Bare', mimeType: 'application/pdf', artifactUrl: 'a.pdf' };
    render(<StartScreen metadata={bare} language="en" onStart={() => {}} />);
    expect(screen.getByText('Bare')).toBeInTheDocument();
  });
});
