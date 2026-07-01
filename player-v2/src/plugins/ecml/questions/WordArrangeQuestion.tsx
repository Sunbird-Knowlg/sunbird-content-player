import React from 'react';
import type { ReorderData, ReorderConfig, ReorderAnswerState, ReorderTab } from '../ecml.types';
import { COLORS, FONT_FAMILY } from '../../../constants';
import { t } from '../../../i18n/i18n';

interface Props {
  data: ReorderData;
  config: ReorderConfig;
  reviewState?: ReorderAnswerState;
  isReview?: boolean;
  compact?: boolean;
  language: string;
  onAnswer(state: ReorderAnswerState, score: number, maxScore: number, pass: boolean): void;
}

function shuffleTabs(tabs: ReorderTab[]): ReorderTab[] {
  const a = [...tabs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const WordArrangeQuestion: React.FC<Props> = ({ data, config, reviewState, isReview = false, compact = false, language, onAnswer }) => {
  const maxScore = config.max_score ?? 1;

  const [tabs] = React.useState<ReorderTab[]>(() => {
    if (reviewState) return reviewState.tabs;
    return shuffleTabs([...data.sentence.tabs]);
  });

  const [selected, setSelected] = React.useState<Array<{ id: string; text: string }>>(() => {
    if (reviewState) return reviewState.selectedWords;
    return [];
  });

  const selectedIds = new Set(selected.map(w => String(w.id)));

  const evaluate = (words: Array<{ id: string; text: string }>) => {
    const userText = words.map(w => w.text).join(' ').replace(/\s/g, '');
    const correctText = data.sentence.text.trim().replace(/\s/g, '');
    const pass = userText === correctText;
    onAnswer(
      { type: 'reorder', selectedWords: words, tabs },
      pass ? maxScore : 0,
      maxScore,
      pass,
    );
  };

  const addWord = (tab: ReorderTab) => {
    if (isReview) return;
    const key = String(tab.id);
    if (selectedIds.has(key)) return;
    const next = [...selected, { id: key, text: tab.text }];
    setSelected(next);
    evaluate(next);
  };

  const removeLast = () => {
    if (isReview || selected.length === 0) return;
    const next = selected.slice(0, -1);
    setSelected(next);
    evaluate(next);
  };

  const correctWords = data.sentence.text.trim().split(/\s+/);
  const userWords = selected.map(w => w.text);
  const isCorrectSentence = isReview && JSON.stringify(userWords) === JSON.stringify(correctWords);

  return (
    <div style={{ fontFamily: FONT_FAMILY, width: '100%', display: 'flex', flexDirection: 'column', gap: compact ? 10 : 14 }}>
      {/* Answer area */}
      <div style={{ flex: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: 20 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--sp-brick,#a85236)', textTransform: 'uppercase', textAlign: 'center' }}>
            Your answer
          </span>
        </div>
        <div style={{
          position: 'relative',
          minHeight: 'clamp(80px, 11cqi, 140px)', maxHeight: 'clamp(120px, 16cqi, 200px)',
          border: `2px dashed ${isReview ? (isCorrectSentence ? '#82a668' : '#d32f2f') : (selected.length > 0 ? 'var(--sp-brick,#a85236)' : '#d6cfc8')}`,
          borderRadius: 20, padding: 'clamp(12px, 1.8cqi, 24px) clamp(16px, 2.1cqi, 28px)',
          background: selected.length > 0 ? '#fdf5f3' : '#faf8f5',
          display: 'flex', flexWrap: 'wrap', gap: 'clamp(5px, 0.8cqi, 9px)', alignItems: 'flex-start', alignContent: 'flex-start',
          overflowY: 'auto',
        }}>
          {/* Undo / clear controls — inside the answer box, top-right */}
          {!isReview && selected.length > 0 && (
            <div style={{ position: 'absolute', top: 'clamp(6px, 1cqi, 12px)', right: 'clamp(6px, 1cqi, 12px)', display: 'flex', alignItems: 'center', gap: 'clamp(5px, 0.7cqi, 9px)', zIndex: 1 }}>
              <button onClick={removeLast} aria-label={t(language, 'REMOVE_LAST_WORD')} title={t(language, 'REMOVE_LAST_WORD')} className="eq-opt" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: COLORS.white, border: `1.5px solid #e2dcd6`, cursor: 'pointer',
                borderRadius: 'clamp(7px, 0.9cqi, 10px)', padding: 'clamp(4px, 0.7cqi, 7px)',
                color: 'var(--sp-brick,#a85236)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            </div>
          )}
          {selected.length === 0 ? (
            <span style={{ width: '100%', textAlign: 'center', color: '#c8b8a9', fontStyle: 'italic', fontSize: 'clamp(14px, 1.6cqi, 20px)', lineHeight: compact ? '44px' : '56px' }}>
              Tap words below to build your sentence...
            </span>
          ) : (
            selected.map((word) => {
              const wordIdx = selected.indexOf(word);
              const isWordCorrect = isReview && correctWords[wordIdx] === word.text;
              return (
                <div key={word.id} style={{
                  display: 'flex', alignItems: 'center',
                  background: isReview
                    ? (isWordCorrect ? '#f0f7ed' : '#fdf2f2')
                    : 'var(--sp-brick,#a85236)',
                  color: isReview ? (isWordCorrect ? '#4a7a5a' : '#c0324a') : COLORS.white,
                  borderRadius: 12, padding: 'clamp(7px, 1.2cqi, 13px) clamp(13px, 2cqi, 20px)',
                  fontSize: 'clamp(15px, 1.6cqi, 20px)', fontWeight: 600,
                  boxShadow: isReview ? 'none' : '0 2px 6px rgba(168,82,54,0.15)',
                }}>
                  <span>{word.text}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Word bank */}
      {!isReview && (
        <div style={{ flex: 'none', display: 'flex', flexDirection: 'column' }}>
          <p style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--sp-brick,#a85236)', textTransform: 'uppercase', margin: '0 0 12px', flexShrink: 0 }}>
            Word bank
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: compact ? 8 : 10, overflowY: 'auto', minHeight: 0, justifyContent: 'center' }}>
            {tabs.map(tab => {
              const used = selectedIds.has(String(tab.id));
              return (
                <button key={tab.id} onClick={() => addWord(tab)} disabled={used}
                  className={used ? undefined : 'eq-opt'}
                  style={{
                    border: `1.5px solid ${used ? COLORS.gray100 : '#d6cfc8'}`,
                    borderRadius: 28, padding: 'clamp(8px, 1.4cqi, 14px) clamp(16px, 2.4cqi, 24px)',
                    background: used ? COLORS.gray50 : COLORS.white,
                    color: used ? COLORS.gray400 : COLORS.obsidian,
                    fontSize: 'clamp(15px, 1.6cqi, 20px)', fontWeight: 600, cursor: used ? 'default' : 'pointer',
                    fontFamily: FONT_FAMILY, transition: 'all 0.12s', touchAction: 'manipulation',
                    boxShadow: used ? 'none' : '0 2px 6px rgba(0,0,0,0.08)',
                  }}
                >
                  {tab.text}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Review: show correct answer */}
      {isReview && !isCorrectSentence && (
        <div style={{ flexShrink: 0, padding: '12px 16px', borderRadius: 12, background: '#f0f7ed', border: '1.5px solid #82a668' }}>
          <p style={{ fontSize: 12, color: '#4a7a5a', fontWeight: 700, margin: '0 0 4px' }}>{t(language, 'CORRECT_ANSWER')}</p>
          <p style={{ fontSize: 15, color: '#4a7a5a', margin: 0 }}>{data.sentence.text}</p>
        </div>
      )}
    </div>
  );
};

export default WordArrangeQuestion;
