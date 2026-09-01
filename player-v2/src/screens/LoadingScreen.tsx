import React from 'react';
import { t } from '../i18n/i18n';
import { COLORS, FONT_FAMILY } from '../constants';

interface Props {
  title?: string;
  language: string;
  progress: number;
  compact?: boolean;
}

const LoadingScreen: React.FC<Props> = ({ title, language, progress, compact = false }) => {
  const s = compact
    ? { title: 18, sub: 14, dot: 9, dotGap: 6, dotMb: 18, mb: 20, barMax: 240 }
    : { title: 32, sub: 22, dot: 13, dotGap: 8, dotMb: 28, mb: 36, barMax: 340 };

  return (
    <div
      className="sp-fade-in"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.white,
        fontFamily: FONT_FAMILY,
        zIndex: 10,
        padding: compact ? '8px 16px' : '16px 24px',
      }}
    >
      {/* Pulse dots */}
      <div
        className="sp-loader-dots"
        role="status"
        aria-label={t(language, 'LOADING')}
        style={{ marginBottom: s.dotMb, gap: s.dotGap }}
      >
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              width:  s.dot,
              height: s.dot,
              borderRadius: '50%',
              background: 'var(--sp-brick)',
              animation: 'sp-pulse 1.2s ease-in-out infinite',
              animationDelay: ['0s', '0.22s', '0.44s'][i],
            }}
          />
        ))}
      </div>

      {title ? (
        <>
          <h2 style={{
            fontSize: s.title,
            fontWeight: 700,
            color: '#4a4a4a',
            lineHeight: 1.3,
            maxWidth: 480,
            textAlign: 'center',
            padding: '0 8px',
            marginBottom: compact ? 6 : 12,
          }}>
            {title}
          </h2>
          <p style={{ fontSize: s.sub, color: COLORS.gray500, marginBottom: s.mb }}>
            {t(language, 'LOADING_TEXT')}
          </p>
        </>
      ) : (
        <p style={{ fontSize: s.sub + 4, color: COLORS.ink, fontWeight: 600, marginBottom: s.mb }}>
          {t(language, 'LOADING_TEXT')}
        </p>
      )}

      {/* Progress bar + percentage */}
      <div style={{ width: '100%', maxWidth: s.barMax, padding: '0 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: compact ? 6 : 8,
        }}>
          <span style={{ fontSize: compact ? 11 : 13, color: COLORS.gray500, fontWeight: 600, letterSpacing: '0.04em' }}>
            {t(language, 'LOADING')}
          </span>
          <span style={{ fontSize: compact ? 13 : 16, color: 'var(--sp-brick)', fontWeight: 700 }}>
            {Math.round(Math.min(progress, 100))}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: compact ? 3 : 5,
          background: COLORS.gray100,
          borderRadius: 5,
          overflow: 'hidden',
        }}>
          <div
            className="sp-progress-fill sp-progress-animate"
            style={{ width: `${Math.min(progress, 100)}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
