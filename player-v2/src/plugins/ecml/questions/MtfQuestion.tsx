import React from 'react';
import type { MtfData, MtfConfig, MtfAnswerState, MtfOption } from '../ecml.types';
import { COLORS, FONT_FAMILY } from '../../../constants';
import { usePointerDrag } from '../usePointerDrag';
import { t } from '../../../i18n/i18n';

interface Props {
  data: MtfData;
  config: MtfConfig;
  reviewState?: MtfAnswerState;
  isReview?: boolean;
  compact?: boolean;
  language: string;
  onAnswer(state: MtfAnswerState, score: number, maxScore: number, pass: boolean): void;
}

/** Sattolo derangement: no item stays in original position */
function derange<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    const j = Math.floor(Math.random() * (a.length - i - 1)) + i + 1;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const THEME_COLOR = 'var(--sp-brick,#a85236)';

const MtfQuestion: React.FC<Props> = ({ data, config, reviewState, isReview = false, compact = false, language, onAnswer }) => {
  const maxScore = config.max_score ?? data.option.optionsLHS.length;

  const lhsOptions = data.option.optionsLHS;
  const rhsOptions = data.option.optionsRHS;

  // shuffledPool: array of original RHS indices in shuffled order (pool of draggable chips)
  const [shuffledPool] = React.useState<number[]>(() => {
    if (reviewState) return reviewState.rhsOrder.map((_, i) => i);
    const indices = rhsOptions.map((_, i) => i);
    return derange(indices);
  });

  // matches: lhsIdx → rhsOriginalIdx (-1 = unmatched)
  const [matches, setMatches] = React.useState<number[]>(() => {
    if (reviewState) return reviewState.rhsOrder;
    return Array(lhsOptions.length).fill(-1);
  });

  // touchSelectedOrigIdx: chip selected by tap (tap-to-place fallback)
  const [touchSelectedOrigIdx, setTouchSelectedOrigIdx] = React.useState<number | null>(null);

  const placedOrigIndices = new Set(matches.filter(v => v >= 0));

  const evaluate = (currentMatches: number[]) => {
    let correctCount = 0;
    currentMatches.forEach((origIdx, lhsIdx) => {
      // correct when the rhs item placed at lhsIdx equals lhsIdx (1:1 positional match)
      if (origIdx === lhsIdx) correctCount++;
    });
    const pass = correctCount === lhsOptions.length;
    const score = config.partial_scoring
      ? parseFloat(((correctCount / lhsOptions.length) * maxScore).toFixed(2))
      : pass ? maxScore : 0;
    const state: MtfAnswerState = {
      type: 'mtf',
      rhsOrder: currentMatches,
      lhsOptions,
      rhsOptions,
    };
    onAnswer(state, score, maxScore, pass);
  };

  // Shared logic used by both drag-drop (desktop) and tap-to-place (mobile)
  const applyDrop = (lhsIdx: number, sourceOrigIdx: number) => {
    if (isReview) return;
    const newMatches = [...matches];
    const prevSlot = newMatches.indexOf(sourceOrigIdx); // where the dragged chip was, if placed
    const occupant = newMatches[lhsIdx];                // chip currently sitting in the target slot
    newMatches[lhsIdx] = sourceOrigIdx;
    // If the dragged chip came from another slot, swap the occupant into that slot
    // (so nothing is silently lost and the displaced chip visibly moves).
    if (prevSlot >= 0 && prevSlot !== lhsIdx) newMatches[prevSlot] = occupant;
    setMatches(newMatches);
    evaluate(newMatches);
  };

  const applyUnplace = (sourceOrigIdx: number) => {
    if (isReview) return;
    const newMatches = matches.map(v => v === sourceOrigIdx ? -1 : v);
    setMatches(newMatches);
    evaluate(newMatches);
  };

  // Unified pointer drag (mouse + touch): drag a chip (payload = origIdx) onto a
  // slot (data-drop-id = lhsIdx) to place, or onto the pool (data-drop-id="pool") to unplace.
  const drag = usePointerDrag<number>({
    onDrop: (origIdx, targetId) => {
      if (isReview || targetId === null) return;
      if (targetId === 'pool') { applyUnplace(origIdx); return; }
      const lhsIdx = Number(targetId);
      if (!Number.isNaN(lhsIdx)) applyDrop(lhsIdx, origIdx);
    },
  });

  const handleRemoveMatch = (lhsIdx: number) => {
    if (isReview) return;
    const newMatches = [...matches];
    newMatches[lhsIdx] = -1;
    setMatches(newMatches);
    evaluate(newMatches);
  };

  const renderOption = (opt: MtfOption) => (
    <>
      {opt.image && <img src={opt.image} alt="" style={{ height: compact ? 32 : 48, borderRadius: 6, marginRight: 8 }} />}
      {opt.text && <span className="ecml-qtitle" dangerouslySetInnerHTML={{ __html: opt.text }} />}
    </>
  );

  const allMatched = lhsOptions.every((_, i) => matches[i] >= 0);

  return (
    <div style={{ fontFamily: FONT_FAMILY, width: '100%', display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12 }}>
      {/* LHS + drop slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12, justifyContent: 'safe center' }}>
        {lhsOptions.map((opt, lhsIdx) => {
          const matchedOrigIdx = matches[lhsIdx];
          const hasMatch = matchedOrigIdx >= 0;
          const color = THEME_COLOR;
          const correct = isReview && matchedOrigIdx === lhsIdx;
          const wrong = isReview && hasMatch && matchedOrigIdx !== lhsIdx;

          let borderColor = hasMatch ? color : '#d6cfc8';
          if (correct) borderColor = '#82a668';
          if (wrong) borderColor = '#d32f2f';

          return (
            <div key={lhsIdx} style={{ display: 'flex', gap: compact ? 8 : 16, alignItems: 'stretch', flexShrink: 0, minHeight: 'clamp(44px, 5.5cqi, 80px)' }}>
              {/* LHS label */}
              <div style={{
                flex: 1, border: `${compact ? 1.5 : 2}px solid ${borderColor}`,
                borderRadius: compact ? 10 : 16, padding: 'clamp(6px, 1.6cqi, 16px) clamp(10px, 2.4cqi, 24px)',
                display: 'flex', alignItems: 'center', gap: 10,
                background: hasMatch ? `${color}12` : COLORS.white,
                color: COLORS.obsidian, fontSize: 'clamp(13px, 1.4cqi, 17px)', fontWeight: 600,
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}>
                <span style={{
                  width: compact ? 9 : 14, height: compact ? 9 : 14, borderRadius: '50%',
                  background: hasMatch ? color : '#d6cfc8', flexShrink: 0,
                }} />
                {renderOption(opt)}
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <svg width={compact ? 18 : 36} height={14} viewBox="0 0 24 12">
                  <line x1="0" y1="6" x2="20" y2="6" stroke={hasMatch ? color : '#d6cfc8'} strokeWidth="2" />
                  <polygon points="18,2 24,6 18,10" fill={hasMatch ? color : '#d6cfc8'} />
                </svg>
              </div>

              {/* RHS drop zone */}
              <div
                data-drop-id={String(lhsIdx)}
                onClick={() => {
                  if (touchSelectedOrigIdx !== null) {
                    applyDrop(lhsIdx, touchSelectedOrigIdx);
                    setTouchSelectedOrigIdx(null);
                  }
                }}
                style={{
                  flex: 1.2,
                  border: drag.overId === String(lhsIdx)
                    ? `2px solid var(--sp-brick,#a85236)`
                    : hasMatch
                    ? `${compact ? 1.5 : 2}px solid ${correct ? '#82a668' : wrong ? '#d32f2f' : color}`
                    : `${compact ? 1.5 : 2}px dashed #d6cfc8`,
                  borderRadius: compact ? 10 : 16, padding: 'clamp(6px, 1.6cqi, 16px) clamp(10px, 2.4cqi, 24px)',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: hasMatch
                    ? correct ? '#f0f7ed' : wrong ? '#fdf2f2' : `${color}12`
                    : '#faf8f5',
                  fontSize: 'clamp(13px, 1.5cqi, 18px)', fontWeight: 600, color: COLORS.obsidian,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                {hasMatch ? (
                  <>
                    <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>{renderOption(rhsOptions[matchedOrigIdx])}</span>
                    {!isReview && (
                      <button
                        onClick={() => handleRemoveMatch(lhsIdx)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: COLORS.gray400, flexShrink: 0, fontSize: 18 }}
                      >✕</button>
                    )}
                    {isReview && (correct
                      ? <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#82a668" strokeWidth="2.5"><polyline points="20,6 9,17 4,12" /></svg>
                      : <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    )}
                  </>
                ) : (
                  <span style={{ color: 'var(--sp-brick,#a85236)', fontSize: 'clamp(12px, 1.3cqi, 16px)', fontStyle: 'italic' }}>{t(language, 'TAP_TO_PLACE')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Answer chips pool */}
      {!isReview && (
        <div
          data-drop-id="pool"
          onClick={() => {
            if (touchSelectedOrigIdx !== null) {
              applyUnplace(touchSelectedOrigIdx);
              setTouchSelectedOrigIdx(null);
            }
          }}
          style={{
            padding: compact ? '7px 10px' : '20px 24px', borderRadius: compact ? 10 : 16, flexShrink: 0,
            background: drag.overId === 'pool' ? '#fdf5f3' : COLORS.gray50,
            border: `1.5px dashed ${drag.overId === 'pool' ? 'var(--sp-brick,#a85236)' : COLORS.gray100}`,
          }}
        >
          <p style={{ textAlign: 'center', fontSize: compact ? 9 : 12, fontWeight: 700, letterSpacing: '0.09em', color: '#c8b8a9', textTransform: 'uppercase', margin: compact ? '0 0 6px' : '0 0 12px' }}>
            {allMatched ? t(language, 'MTF_ALL_MATCHED') : t(language, 'TAP_SLOT_HINT')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: compact ? 8 : 12, justifyContent: 'center' }}>
            {shuffledPool.map(origIdx => {
              const isPlaced = placedOrigIndices.has(origIdx);
              const opt = rhsOptions[origIdx];
              return (
                <div
                  key={origIdx}
                  {...(isPlaced ? {} : drag.sourceProps(origIdx, String(origIdx)))}
                  onClick={e => {
                    e.stopPropagation();
                    if (isPlaced || isReview || drag.consumeClick()) return;
                    setTouchSelectedOrigIdx(prev => prev === origIdx ? null : origIdx);
                  }}
                  className={isPlaced || isReview ? undefined : 'eq-opt'}
                  style={{
                    border: touchSelectedOrigIdx === origIdx
                      ? `2px solid var(--sp-brick,#a85236)`
                      : `1.5px solid ${COLORS.gray100}`,
                    borderRadius: compact ? 9 : 16, padding: compact ? '6px 10px' : '16px 24px',
                    background: touchSelectedOrigIdx === origIdx
                      ? '#fdf5f3'
                      : isPlaced ? COLORS.gray50 : COLORS.white,
                    opacity: isPlaced ? 0.35 : (drag.activeKey === String(origIdx) ? 0.4 : 1),
                    cursor: isPlaced ? 'default' : 'grab',
                    touchAction: isPlaced ? undefined : 'none',
                    pointerEvents: drag.activeKey === String(origIdx) ? 'none' : undefined,
                    fontSize: 'clamp(13px, 1.5cqi, 18px)', fontWeight: 600, color: COLORS.obsidian,
                    display: 'flex', alignItems: 'center', gap: 10,
                    userSelect: 'none',
                    boxShadow: touchSelectedOrigIdx === origIdx
                      ? '0 0 0 3px rgba(168,82,54,0.15)'
                      : isPlaced ? 'none' : '0 2px 6px rgba(0,0,0,0.06)',
                    transition: 'all 0.15s',
                  }}
                >
                  {!isPlaced && (
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={COLORS.gray400} strokeWidth="2.2">
                      <line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="18" x2="16" y2="18" />
                    </svg>
                  )}
                  {opt && renderOption(opt)}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default MtfQuestion;
