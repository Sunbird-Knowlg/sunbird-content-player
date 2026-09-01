import React from 'react';
import { t } from '../i18n/i18n';
import { COLORS, FONT_FAMILY } from '../constants';

interface Props {
  title: string;
  language: string;
  timeSpentSec: number;
  compact?: boolean;
  onReplay(): void;
  onDone(): void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const EndScreen: React.FC<Props> = ({ title, language, timeSpentSec, compact = false, onReplay, onDone }) => {
  const s = compact
    ? {
        circle: 44, checkIcon: 20, headingFs: 20, titleFs: 14,
        headingMb: 6, titleMb: 16,
        cardPad: '12px 28px', cardMb: 16, cardGap: 12,
        clockSize: 22, timeFs: 28, timeLabelFs: 10,
        btnH: 40, btnFs: 13, btnGap: 8, btnMax: 320,
      }
    : {
        circle: 72, checkIcon: 32, headingFs: 32, titleFs: 24,
        headingMb: 10, titleMb: 32,
        cardPad: '26px 72px', cardMb: 40, cardGap: 22,
        clockSize: 36, timeFs: 40, timeLabelFs: 12,
        btnH: 52, btnFs: 15, btnGap: 12, btnMax: 360,
      };

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
      {/* Check circle */}
      <div style={{
        width: s.circle, height: s.circle, borderRadius: '50%',
        background: COLORS.forest,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: compact ? 12 : 24,
        boxShadow: '0 8px 24px rgba(130,166,104,0.35)',
      }}>
        <svg width={s.checkIcon} height={s.checkIcon} viewBox="0 0 24 24" fill="none"
          stroke={COLORS.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      </div>

      <h2 style={{ fontSize: s.headingFs, fontWeight: 700, color: COLORS.obsidian, marginBottom: s.headingMb, textAlign: 'center' }}>
        {t(language, 'FINISHED')}
      </h2>

      <p style={{ fontSize: s.titleFs, color: '#4a4a4a', textAlign: 'center', maxWidth: 460, lineHeight: 1.4, marginBottom: s.titleMb }}>
        {title}
      </p>

      {/* Time card */}
      {timeSpentSec > 0 && (
        <div style={{
          background: COLORS.white,
          borderRadius: compact ? 10 : 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
          border: `1px solid ${COLORS.gray100}`,
          padding: s.cardPad,
          display: 'flex', alignItems: 'center', gap: s.cardGap,
          marginBottom: s.cardMb,
          minWidth: compact ? 180 : 280,
        }}>
          <svg width={s.clockSize} height={s.clockSize} viewBox="0 0 24 24" fill="none"
            stroke={COLORS.ink} strokeWidth="1.5" strokeLinecap="round" opacity={0.7}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          <div>
            <p style={{ fontSize: s.timeLabelFs, fontWeight: 700, letterSpacing: '0.1em', color: COLORS.gray400, textTransform: 'uppercase', marginBottom: 4 }}>
              TIME
            </p>
            <p style={{ fontSize: s.timeFs, fontWeight: 700, color: COLORS.obsidian, letterSpacing: '0.02em', lineHeight: 1 }}>
              {formatTime(timeSpentSec)}
            </p>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: s.btnGap, width: '100%', maxWidth: s.btnMax }}>
        <button
          onClick={onReplay}
          aria-label={t(language, 'REPLAY')}
          style={{
            flex: 1, height: s.btnH, borderRadius: 10,
            border: `1.5px solid ${COLORS.gray100}`, background: 'transparent', color: COLORS.charcoal,
            fontFamily: FONT_FAMILY, fontSize: s.btnFs, fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <ReplayIcon size={compact ? 13 : 16} />
          {t(language, 'REPLAY')}
        </button>

        <button
          onClick={onDone}
          aria-label={t(language, 'EXIT')}
          style={{
            flex: 1, height: s.btnH, borderRadius: 10, border: 'none',
            background: 'var(--sp-brick)', color: COLORS.white,
            fontFamily: FONT_FAMILY, fontSize: s.btnFs, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {t(language, 'EXIT')}
        </button>
      </div>
    </div>
  );
};

const ReplayIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1,4 1,10 7,10" />
    <path d="M3.51,15a9,9,0,1,0,.49-3.26" />
  </svg>
);

export default EndScreen;
