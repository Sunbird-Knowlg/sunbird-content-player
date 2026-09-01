/**
 * QuestionSetReview: shows all questions in read-only review mode
 * with the user's stored answer state overlaid.
 */
import React from 'react';
import type {
  EcmlQuestion,
  QuestionAnswerState,
  McqAnswerState,
  MtfAnswerState,
  FtbAnswerState,
  SeqAnswerState,
  ReorderAnswerState,
  McqData,
  MtfData,
  FtbData,
  SeqData,
  ReorderData,
  McqConfig,
  MtfConfig,
  FtbConfig,
  SeqConfig,
  ReorderConfig,
} from './ecml.types';
import type { QuestionSetScore } from './QuestionSet';
import { COLORS, FONT_FAMILY } from '../../constants';
import { useCompact } from './useCompact';
import McqQuestion from './questions/McqQuestion';
import TrueFalseQuestion from './questions/TrueFalseQuestion';
import FtbQuestion from './questions/FtbQuestion';
import MtfQuestion from './questions/MtfQuestion';
import SequenceQuestion from './questions/SequenceQuestion';
import WordArrangeQuestion from './questions/WordArrangeQuestion';

interface Props {
  questions: EcmlQuestion[];
  results: QuestionSetScore & { stateMap?: Map<string, { state: QuestionAnswerState; score: number; maxScore: number; pass: boolean }> };
  language?: string;
  onClose(): void;
}

function isTrueFalse(q: EcmlQuestion): boolean {
  if (q.type !== 'mcq') return false;
  const opts = (q.data as McqData).options;
  if (opts.length !== 2) return false;
  const texts = opts.map(o => (o.text ?? '').toLowerCase().trim());
  return (
    (texts.includes('true') && texts.includes('false')) ||
    (texts.includes('yes') && texts.includes('no'))
  );
}

const noop = () => {};

const QuestionSetReview: React.FC<Props> = ({ questions, results, language = 'en', onClose }) => {
  const [idx, setIdx] = React.useState(0);
  const [wrapRef, compact] = useCompact();
  const q = questions[idx];
  const total = questions.length;
  const result = results.stateMap?.get(q.id);
  const reviewState = result?.state;

  const renderQuestion = (q: EcmlQuestion, reviewState?: QuestionAnswerState) => {
    if (q.type === 'mcq') {
      if (isTrueFalse(q)) {
        return (
          <TrueFalseQuestion
            data={q.data as McqData}
            config={q.config as McqConfig}
            reviewState={reviewState as McqAnswerState | undefined}
            isReview={true}
            compact={compact}
            language={language}
            onAnswer={noop}
          />
        );
      }
      return (
        <McqQuestion
          data={q.data as McqData}
          config={q.config as McqConfig}
          reviewState={reviewState as McqAnswerState | undefined}
          isReview={true}
          compact={compact}
          onAnswer={noop}
        />
      );
    }
    if (q.type === 'ftb') {
      return (
        <FtbQuestion
          data={q.data as FtbData}
          config={q.config as FtbConfig}
          reviewState={reviewState as FtbAnswerState | undefined}
          isReview={true}
          compact={compact}
          language={language}
          onAnswer={noop}
        />
      );
    }
    if (q.type === 'mtf') {
      return (
        <MtfQuestion
          data={q.data as MtfData}
          config={q.config as MtfConfig}
          reviewState={reviewState as MtfAnswerState | undefined}
          isReview={true}
          compact={compact}
          language={language}
          onAnswer={noop}
        />
      );
    }
    if (q.type === 'sequence') {
      return (
        <SequenceQuestion
          data={q.data as SeqData}
          config={q.config as SeqConfig}
          reviewState={reviewState as SeqAnswerState | undefined}
          isReview={true}
          compact={compact}
          onAnswer={noop}
        />
      );
    }
    if (q.type === 'reorder') {
      return (
        <WordArrangeQuestion
          data={q.data as ReorderData}
          config={q.config as ReorderConfig}
          reviewState={reviewState as ReorderAnswerState | undefined}
          isReview={true}
          compact={compact}
          language={language}
          onAnswer={noop}
        />
      );
    }
    return null;
  };

  return (
    <div ref={wrapRef} className="eq-scale" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: FONT_FAMILY, background: COLORS.white }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px', borderBottom: `1px solid ${COLORS.gray100}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: COLORS.white,
      }}>
        <span style={{ fontSize: 'var(--eq-fs-label)', fontWeight: 600, color: COLORS.gray500 }}>
          Review — {idx + 1} / {total}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {result ? (
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: result.pass ? '#e8f5e2' : '#fdecea',
              color: result.pass ? '#2e7d52' : '#d32f2f',
            }}>
              {result.score}/{result.maxScore} pts
            </span>
          ) : (
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: COLORS.gray50, color: COLORS.gray400,
            }}>Skipped</span>
          )}
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: COLORS.gray500, fontSize: 14, padding: '4px 8px',
            fontFamily: FONT_FAMILY,
          }}>✕ Close</button>
        </div>
      </div>

      {/* Question */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{
          minHeight: '100%',
          padding: compact ? '14px 32px 14px' : '20px 40px 24px',
          boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'safe center', alignItems: 'center',
        }}>
          <div style={{ width: '100%', maxWidth: compact ? 560 : 720 }}>
            {renderQuestion(q, reviewState)}
            {!result && (
              <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: COLORS.gray50, border: `1px solid ${COLORS.gray100}` }}>
                <p style={{ fontSize: 13, color: COLORS.gray400, fontStyle: 'italic' }}>You skipped this question.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${COLORS.gray100}`, display: 'flex', gap: 10 }}>
        <button
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0}
          style={{
            flex: 1, height: 44, borderRadius: 10,
            border: `1.5px solid ${COLORS.gray100}`, background: 'transparent',
            color: idx === 0 ? COLORS.gray100 : COLORS.charcoal,
            fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 500, cursor: idx === 0 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6" /></svg>
          Prev
        </button>

        {/* Dot indicators */}
        <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {questions.map((q, i) => {
            const r = results.stateMap?.get(q.id);
            let color: string = COLORS.gray100;
            if (r) color = r.pass ? '#82a668' : '#d32f2f';
            return (
              <div key={i}
                onClick={() => setIdx(i)}
                style={{
                  width: i === idx ? 20 : 8, height: 8, borderRadius: 4,
                  background: i === idx ? 'var(--sp-brick,#a85236)' : color,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              />
            );
          })}
        </div>

        <button
          onClick={() => setIdx(i => Math.min(total - 1, i + 1))}
          disabled={idx === total - 1}
          style={{
            flex: 1, height: 44, borderRadius: 10,
            border: `1.5px solid ${COLORS.gray100}`, background: 'transparent',
            color: idx === total - 1 ? COLORS.gray100 : COLORS.charcoal,
            fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 500, cursor: idx === total - 1 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          Next
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6" /></svg>
        </button>
      </div>
    </div>
  );
};

export default QuestionSetReview;
