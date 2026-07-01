import React from 'react';
import type { McqData, McqConfig, McqAnswerState } from '../ecml.types';
import { COLORS, FONT_FAMILY } from '../../../constants';
import { t } from '../../../i18n/i18n';

interface Props {
  data: McqData;
  config: McqConfig;
  reviewState?: McqAnswerState;
  isReview?: boolean;
  compact?: boolean;
  language: string;
  onAnswer(state: McqAnswerState, score: number, maxScore: number, pass: boolean): void;
}

const TrueFalseQuestion: React.FC<Props> = ({ data, config, reviewState, isReview = false, compact = false, language, onAnswer }) => {
  const maxScore = config.max_score ?? 1;
  const options = reviewState ? reviewState.options : data.options;
  const [selected, setSelected] = React.useState<number | null>(
    reviewState ? reviewState.selectedIndex : null,
  );

  const handleSelect = (idx: number) => {
    if (isReview) return;
    setSelected(idx);
    const opt = options[idx];
    const pass = !!opt.isCorrect;
    const score = pass ? maxScore : 0;
    onAnswer({ type: 'mcq', selectedIndex: idx, options }, score, maxScore, pass);
  };

  return (
    <div style={{ fontFamily: FONT_FAMILY, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: compact ? 10 : 14, alignItems: 'stretch' }}>
        {options.map((opt, idx) => {
          const isSel = selected === idx;
          const isCorrect = isReview && !!opt.isCorrect;
          const isWrong = isReview && isSel && !opt.isCorrect;
          const isTrue = (opt.text ?? '').toLowerCase().includes('true') || idx === 0;
          const label = opt.text ?? (idx === 0 ? t(language, 'TRUE') : t(language, 'FALSE'));

          let borderColor: string = COLORS.gray100;
          let bg: string = COLORS.white;
          let iconColor: string = COLORS.gray400;
          let textColor: string = COLORS.obsidian;
          if (isSel && !isReview) { borderColor = 'var(--sp-brick,#a85236)'; bg = '#fdf5f3'; iconColor = 'var(--sp-brick,#a85236)'; textColor = 'var(--sp-brick,#a85236)'; }
          if (isCorrect) { borderColor = '#82a668'; bg = '#f0f7ed'; iconColor = '#82a668'; textColor = '#4a7a5a'; }
          if (isWrong) { borderColor = '#d32f2f'; bg = '#fdf2f2'; iconColor = '#d32f2f'; textColor = '#c0324a'; }

          return (
            <div
              key={idx}
              onClick={() => handleSelect(idx)}
              role="radio"
              aria-checked={isSel}
              tabIndex={isReview ? -1 : 0}
              className={isReview ? undefined : 'eq-opt'}
              style={{
                flex: 1, border: `2px solid ${borderColor}`, borderRadius: 18,
                background: bg, padding: 'clamp(14px, 2.6cqi, 28px) clamp(14px, 2.2cqi, 24px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(12px, 1.7cqi, 20px)',
                cursor: isReview ? 'default' : 'pointer', transition: 'all 0.15s',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 'clamp(56px, 8cqi, 96px)', height: 'clamp(56px, 8cqi, 96px)', borderRadius: '50%',
                background: isSel || isCorrect || isWrong ? COLORS.white : COLORS.gray50,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isTrue ? (
                  <svg width={compact ? 30 : 40} height={compact ? 30 : 40} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                ) : (
                  <svg width={compact ? 30 : 40} height={compact ? 30 : 40} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 'clamp(18px, 2cqi, 26px)', fontWeight: 700, color: textColor }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrueFalseQuestion;
