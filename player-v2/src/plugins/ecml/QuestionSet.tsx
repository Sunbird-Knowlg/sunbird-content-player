import React from 'react';
import type {
  EcmlQuestion,
  QuestionResult,
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
import { COLORS, FONT_FAMILY } from '../../constants';
import { useCompact } from './useCompact';
import McqQuestion from './questions/McqQuestion';
import TrueFalseQuestion from './questions/TrueFalseQuestion';
import FtbQuestion from './questions/FtbQuestion';
import MtfQuestion from './questions/MtfQuestion';
import SequenceQuestion from './questions/SequenceQuestion';
import WordArrangeQuestion from './questions/WordArrangeQuestion';
import { t } from '../../i18n/i18n';

export interface QuestionResultEntry {
  state: import('./ecml.types').QuestionAnswerState;
  score: number;
  maxScore: number;
  pass: boolean;
}

export interface QuestionSetScore {
  totalScore: number;
  maxScore: number;
  answeredCount: number;
  skippedCount: number;
  /** stateMap for review: questionId → result entry */
  stateMap: Map<string, QuestionResultEntry>;
}

interface Props {
  questions: EcmlQuestion[];
  language?: string;
  dir?: 'ltr' | 'rtl';
  onComplete(score: QuestionSetScore): void;
  onAssess?(data: {
    questionId: string;
    type: EcmlQuestion['type'];
    score: number;
    maxScore: number;
    pass: boolean;
    index: number;
    resvalues?: Array<Record<string, unknown>>;
  }): void;
  /** Fired when the learner navigates to a different question (1-based index). */
  onNavigate?(index: number): void;
  onMenuOpen?(): void;
}

type Mode = 'answering' | 'submit-confirm' | 'review';

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

function isSplitLayout(q: EcmlQuestion): boolean {
  if (q.type !== 'mcq') return false;
  const layout = ((q.config as McqConfig).layout ?? '').toLowerCase();
  return layout === 'vertical2' || layout === 'grid2';
}

function eyebrowFor(q: EcmlQuestion, language: string): string {
  if (q.type === 'ftb') return t(language, 'QT_FTB');
  if (q.type === 'mtf') return t(language, 'QT_MTF');
  if (q.type === 'sequence') return t(language, 'QT_SEQUENCE');
  if (q.type === 'reorder') return t(language, 'QT_REORDER');
  return t(language, 'QT_MCQ');
}

/** Short type code shown in the header (top-right), like "MCQ". */
function typeLabelFor(q: EcmlQuestion, language: string): string {
  if (q.type === 'ftb') return t(language, 'LABEL_FTB');
  if (q.type === 'mtf') return t(language, 'LABEL_MTF');
  if (q.type === 'sequence') return t(language, 'LABEL_SEQUENCE');
  if (q.type === 'reorder') return t(language, 'LABEL_REORDER');
  if (q.type === 'mcq') return isTrueFalse(q) ? t(language, 'LABEL_TF') : t(language, 'LABEL_MCQ');
  return t(language, 'QUESTION');
}

function questionTextFor(q: EcmlQuestion): { text?: string; image?: string } {
  // ftb: text is the fill-template rendered inline — don't show in header
  if (q.type === 'ftb') return {};
  const d = q.data as { question?: { text?: string; image?: string } };
  return { text: d?.question?.text, image: d?.question?.image };
}

/* ─── Three-dot menu icon ─── */
const DotsIcon: React.FC = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="5" r="1.6" fill="currentColor" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    <circle cx="12" cy="19" r="1.6" fill="currentColor" />
  </svg>
);

/* ─── Question Text Card — separate section component ─── */
const QuestionTextCard: React.FC<{ q: EcmlQuestion; compact?: boolean; language: string }> = ({ q, compact = false, language }) => {
  /* Narrow (mobile) → slim band (no card chrome). Used by the review screen;
     the main answering view puts the question in the header on mobile instead. */
  const band = compact;
  const { text, image } = questionTextFor(q);
  if (!text && !image) return null;
  if (isSplitLayout(q) || q.type === 'ftb') return null;

  return (
    <div style={{
      /* Mobile: render as a SLIM BAND — no card chrome (border/shadow/radius/big
         padding) — directly on the page bg so the question takes minimal height
         and the options get the freed space. Desktop/collection keep the card. */
      background: band ? 'transparent' : COLORS.white,
      borderRadius: band ? 0 : 'clamp(16px, 1.8cqi, 24px)',
      padding: band ? '0' : 'clamp(18px, 2.4cqi, 32px) clamp(20px, 2.8cqi, 36px)',
      border: band ? 'none' : `1px solid ${COLORS.gray100}`,
      boxShadow: band ? 'none' : '0 4px 18px rgba(0,0,0,0.05)',
      /* Wider than the options below (fills the group) so it isn't a small
         centered card marooned in side gaps. Options stay narrower + centered. */
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: band ? 3 : 'clamp(8px, 1cqi, 14px)',
    }}>
      {/* QUESTION eyebrow */}
      <span style={{
        fontSize: 'var(--eq-fs-eyebrow)',
        fontWeight: 700,
        letterSpacing: '0.12em',
        color: '#b3aaa0',
        textTransform: 'uppercase',
      }}>
        {t(language, 'QUESTION')}
      </span>
      <div style={{
        display: 'flex',
        flexDirection: compact ? 'column' : 'row',
        gap: compact ? 7 : 'var(--eq-gap)',
        alignItems: image && !compact ? 'center' : 'stretch',
      }}>
        {image && (
          <img src={image} alt="question" style={{
            maxHeight: 'clamp(44px, 4.5cqi, 72px)',
            maxWidth: 'clamp(72px, 8cqi, 110px)',
            borderRadius: 10,
            objectFit: 'contain',
            alignSelf: compact ? 'flex-start' : 'center',
            flexShrink: 0,
          }} />
        )}
        {text && (
          <h2 className="ecml-qtitle" style={{
            fontSize: 'var(--eq-fs-title)',
            fontWeight: 700,
            color: COLORS.obsidian,
            letterSpacing: '-0.01em',
            lineHeight: 1.32,
            margin: 0,
            textAlign: 'left',
            flex: 1,
          }} dangerouslySetInnerHTML={{ __html: text }} />
        )}
      </div>
    </div>
  );
};

/* ─── Question header — progress bar + counter + type label + menu ─── */
interface QuestionHeaderProps {
  q: EcmlQuestion;
  currentIdx: number;
  totalQ: number;
  onMenuOpen?(): void;
  compact?: boolean;
  language: string;
  /* When tight (narrow OR short embed) the header becomes a white block and the
     question text merges into it (under the counter/type/menu row) so the body
     has no separate question band — options start right below the header. */
  tight?: boolean;
}

const QuestionHeader: React.FC<QuestionHeaderProps> = ({
  q, currentIdx, totalQ, onMenuOpen, language, tight = false,
}) => {
  const typeLabel = typeLabelFor(q, language);
  const pct = ((currentIdx + 1) / totalQ) * 100;
  const { text: qText, image: qImage } = questionTextFor(q);
  const showQuestionInHeader = tight && !isSplitLayout(q) && q.type !== 'ftb' && !!(qText || qImage);

  return (
    <div style={{
      flexShrink: 0,
      background: tight ? COLORS.white : 'transparent',
      boxShadow: tight ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
      /* sharp bottom edge (no rounded corners) when merged */
      position: 'relative', zIndex: 5,
    }}>
      {/* Slim progress bar pinned to the top edge */}
      <div style={{ height: 'clamp(3px, 0.4cqi, 4px)', background: COLORS.gray100, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'var(--sp-brick,#a85236)', transition: 'width 0.3s',
        }} />
      </div>

      {/* One row: counter (left) · question title (middle, mobile only) · type + menu (right).
          On mobile the title fills the otherwise-empty middle space instead of taking
          its own row. Sizes are fluid (clamp/cqi) so the bar scales with embed width. */}
      <div style={{
        padding: `${tight ? '20px' : 'clamp(7px, 1.1cqi, 13px)'} clamp(12px, 2cqi, 24px)`,
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(8px, 1.6cqi, 16px)',
      }}>
        <span style={{ fontSize: 'var(--eq-fs-label)', color: COLORS.gray400, fontWeight: 600, letterSpacing: '0.03em', flexShrink: 0 }}>
          {currentIdx + 1} / {totalQ}
        </span>

        {/* Question title inline (mobile/tight only) — fills middle, single line, ellipsis */}
        {showQuestionInHeader ? (
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {qImage && (
              <img src={qImage} alt="question" style={{ maxHeight: 32, maxWidth: 48, borderRadius: 6, objectFit: 'contain', flexShrink: 0 }} />
            )}
            {qText && (
              <h2 className="ecml-qtitle" style={{
                flex: 1, minWidth: 0, margin: 0,
                fontSize: 'clamp(14px, 4cqi, 19px)', fontWeight: 700, color: COLORS.obsidian,
                letterSpacing: '-0.01em', lineHeight: 1.25,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }} dangerouslySetInnerHTML={{ __html: qText }} />
            )}
          </div>
        ) : (
          <span style={{ flex: 1 }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(7px, 1cqi, 12px)', flexShrink: 0 }}>
          <span style={{
            fontSize: 'var(--eq-fs-label)',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'var(--sp-brick, #a85236)',
            textTransform: 'uppercase' as const,
          }}>
            {typeLabel}
          </span>
          {onMenuOpen && (
            <button
              onClick={onMenuOpen}
              aria-label={t(language, 'OPEN_MENU')}
              style={{
                background: COLORS.white,
                border: `1px solid ${COLORS.gray100}`,
                cursor: 'pointer',
                width: 'clamp(26px, 2.9cqi, 34px)', height: 'clamp(26px, 2.9cqi, 34px)',
                borderRadius: 'clamp(7px, 0.9cqi, 9px)', color: COLORS.gray500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <DotsIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const QuestionSet: React.FC<Props> = ({ questions, language = 'en', dir = 'ltr', onComplete, onAssess, onNavigate, onMenuOpen }) => {
  const [mode, setMode] = React.useState<Mode>('answering');
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [wrapRef, compact, short, width, coarse] = useCompact();
  /* `compact` (width<640) drives LAYOUT switches only (stacking/wrapping/gutters).
     SIZES use fluid clamp(cqi) so they scale smoothly across every width — see notes. */
  const splitStacked = width < 680;
  const GUTTER = compact ? 40 : 64;   // horizontal padding clearing the nav arrows
  const MAXW = compact ? '100%' : 1000; // wide content cap for the question card
  /* Mobile (compact) gets tighter vertical rhythm so a ≤4-option question fits
     without scrolling; desktop/collection unchanged. */
  const vPad = compact ? 8 : (short ? 10 : 20);  // vertical padding of the scroll body
  const vGap = compact ? 10 : (short ? 12 : 20); // gap between question card and interaction
  /* "tight" = a REAL touch device (coarse pointer) that is also small —
     portrait phone (compact, width<640) OR landscape phone (short, height<500).
     Gating on `coarse` is what stops a desktop collection/course embed (fine
     pointer + hover) from ever getting the phone layout, even though its size
     can overlap a landscape phone's. Touch + small → question merges into the
     white header row (no separate card); everything else keeps the desktop card. */
  const tight = coarse && (compact || short);

  /* Question navigation → IMPRESSION (per-question view). Skip the initial mount. */
  const navStartedRef = React.useRef(false);
  React.useEffect(() => {
    if (mode !== 'answering') return;
    if (!navStartedRef.current) { navStartedRef.current = true; return; }
    onNavigate?.(currentIdx + 1);
  }, [currentIdx, mode, onNavigate]);
  const [results, setResults] = React.useState<Map<string, QuestionResult>>(new Map());
  const [reviewIdx, setReviewIdx] = React.useState(0);

  const totalQ = questions.length;
  const currentQ = questions[currentIdx];
  const answeredIds = new Set(results.keys());
  const answeredCount = answeredIds.size;
  const skippedCount = totalQ - answeredCount;

  /* ─── Scoring helpers ─── */
  const computeTotals = (): QuestionSetScore => {
    let totalScore = 0;
    let maxScore = 0;
    const stateMap = new Map<string, QuestionResultEntry>();
    results.forEach(r => {
      totalScore += r.score;
      maxScore += r.maxScore;
      stateMap.set(r.questionId, { state: r.state, score: r.score, maxScore: r.maxScore, pass: r.pass });
    });
    // Add maxScore for unanswered questions
    questions.forEach(q => {
      if (!results.has(q.id)) {
        maxScore += (q.config as McqConfig).max_score ?? 1;
      }
    });
    return { totalScore, maxScore, answeredCount, skippedCount, stateMap };
  };

  /* ─── Answer handler ─── */
  const handleAnswer = (
    questionId: string,
    type: EcmlQuestion['type'],
    state: QuestionAnswerState,
    score: number,
    maxScore: number,
    pass: boolean,
  ) => {
    const result: QuestionResult = { questionId, type, score, maxScore, pass, state };
    setResults(prev => new Map(prev).set(questionId, result));
    const index = questions.findIndex(q => q.id === questionId) + 1;
    onAssess?.({
      questionId, type, score, maxScore, pass, index,
      resvalues: [{ [questionId]: JSON.stringify(state) }],
    });
  };

  /* ─── Navigation ─── */
  const goNext = () => {
    if (currentIdx < totalQ - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setMode('submit-confirm');
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  };

  /* Emit one ASSESS per question at submit — mirrors the old ECML player, which
     evaluates the WHOLE question set on submit and logs an ASSESS for every
     question (answered or not). Relying only on the per-interaction onAssess in
     handleAnswer meant unanswered/uncommitted questions produced NO ASSESS, so
     the portal's assessment payload arrived with events:[] and Best Score showed
     "x/0". Firing here guarantees the assessment total is always recorded.
     (Duplicate ASSESS for an answered question is fine — consumers dedupe by
     item.id, same as the old player which also double-logged.) */
  const emitAllAssess = () => {
    questions.forEach((q, i) => {
      const r = results.get(q.id);
      const maxScore = r?.maxScore ?? ((q.config as McqConfig).max_score ?? 1);
      onAssess?.({
        questionId: q.id,
        type: q.type,
        score: r?.score ?? 0,
        maxScore,
        pass: r?.pass ?? false,
        index: i + 1,
        resvalues: r ? [{ [q.id]: JSON.stringify(r.state) }] : [],
      });
    });
  };

  const handleSubmit = () => {
    emitAllAssess();
    setMode('review');
    setReviewIdx(0);
    onComplete(computeTotals());
  };

  /* ─── Question renderer ─── */
  const renderQuestion = (q: EcmlQuestion, reviewState?: QuestionAnswerState, isReview: boolean = false) => {
    if (q.type === 'mcq') {
      if (isTrueFalse(q)) {
        return (
          <TrueFalseQuestion
            data={q.data as McqData}
            config={q.config as McqConfig}
            reviewState={reviewState as McqAnswerState | undefined}
            isReview={isReview}
            compact={compact}
            language={language}
            onAnswer={(state, score, maxScore, pass) =>
              handleAnswer(q.id, 'mcq', state, score, maxScore, pass)}
          />
        );
      }
      return (
        <McqQuestion
          data={q.data as McqData}
          config={q.config as McqConfig}
          reviewState={reviewState as McqAnswerState | undefined}
          isReview={isReview}
          compact={compact}
          onAnswer={(state, score, maxScore, pass) =>
            handleAnswer(q.id, 'mcq', state, score, maxScore, pass)}
        />
      );
    }

    if (q.type === 'ftb') {
      return (
        <FtbQuestion
          data={q.data as FtbData}
          config={q.config as FtbConfig}
          reviewState={reviewState as FtbAnswerState | undefined}
          isReview={isReview}
          compact={compact}
          language={language}
          onAnswer={(state, score, maxScore, pass) =>
            handleAnswer(q.id, 'ftb', state, score, maxScore, pass)}
        />
      );
    }

    if (q.type === 'mtf') {
      return (
        <MtfQuestion
          data={q.data as MtfData}
          config={q.config as MtfConfig}
          reviewState={reviewState as MtfAnswerState | undefined}
          isReview={isReview}
          compact={compact}
          language={language}
          onAnswer={(state, score, maxScore, pass) =>
            handleAnswer(q.id, 'mtf', state, score, maxScore, pass)}
        />
      );
    }

    if (q.type === 'sequence') {
      return (
        <SequenceQuestion
          data={q.data as SeqData}
          config={q.config as SeqConfig}
          reviewState={reviewState as SeqAnswerState | undefined}
          isReview={isReview}
          compact={compact}
          onAnswer={(state, score, maxScore, pass) =>
            handleAnswer(q.id, 'sequence', state, score, maxScore, pass)}
        />
      );
    }

    if (q.type === 'reorder') {
      return (
        <WordArrangeQuestion
          data={q.data as ReorderData}
          config={q.config as ReorderConfig}
          reviewState={reviewState as ReorderAnswerState | undefined}
          isReview={isReview}
          compact={compact}
          language={language}
          onAnswer={(state, score, maxScore, pass) =>
            handleAnswer(q.id, 'reorder', state, score, maxScore, pass)}
        />
      );
    }

    return <div style={{ color: COLORS.gray400, padding: 24 }}>{t(language, 'UNSUPPORTED_QTYPE')}: {q.type}</div>;
  };

  /* ─── Submit confirm screen ─── */
  if (mode === 'submit-confirm') {
    return (
      <SubmitConfirmScreen
        totalCount={totalQ}
        answeredCount={answeredCount}
        skippedCount={skippedCount}
        language={language}
        dir={dir}
        onReview={() => { setCurrentIdx(0); setMode('answering'); }}
        onSubmit={handleSubmit}
      />
    );
  }

  /* ─── Review mode ─── */
  if (mode === 'review') {
    const q = questions[reviewIdx];
    const result = results.get(q.id);
    const reviewState = result?.state;
    const isAnswered = !!result;
    const { text: rText, image: rImage } = questionTextFor(q);
    const hasTextOrImg = !!(rText || rImage) && !isSplitLayout(q) && q.type !== 'ftb';

    return (
      <div ref={wrapRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: FONT_FAMILY, background: COLORS.white, direction: dir }}>
        {/* Review header */}
        <div style={{
          padding: compact ? '10px 20px' : '12px 20px', borderBottom: `1px solid ${COLORS.gray100}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: COLORS.white, flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.gray500 }}>
            {t(language, 'REVIEW')} — {t(language, 'QUESTION')} {reviewIdx + 1} / {totalQ}
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isAnswered ? (
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
              }}>{t(language, 'STAT_SKIPPED')}</span>
            )}
          </div>
        </div>

        {/* Question */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {hasTextOrImg && (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: '100%', maxWidth: compact ? '100%' : 1000, padding: compact ? '10px 12px' : '16px 20px', boxSizing: 'border-box' }}>
                <QuestionTextCard q={q} compact={compact} language={language} />
              </div>
            </div>
          )}
          <div style={{
            flex: 1,
            padding: compact ? '14px 32px 14px' : '20px 40px 24px',
            boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'safe center', alignItems: 'center',
          }}>
            <div style={{ width: '100%', maxWidth: compact ? 560 : 720 }}>
              {renderQuestion(q, reviewState, true)}
              {!isAnswered && (
                <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: COLORS.gray50, border: `1px solid ${COLORS.gray100}` }}>
                  <p style={{ fontSize: 13, color: COLORS.gray400, fontStyle: 'italic' }}>
                    {t(language, 'SKIPPED_MSG')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review nav */}
        <div style={{ padding: compact ? '10px 20px' : '12px 20px', borderTop: `1px solid ${COLORS.gray100}`, display: 'flex', gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => setReviewIdx(i => Math.max(0, i - 1))}
            disabled={reviewIdx === 0}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              border: `1.5px solid ${COLORS.gray100}`, background: 'transparent',
              color: reviewIdx === 0 ? COLORS.gray100 : COLORS.charcoal,
              fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 500, cursor: reviewIdx === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6" /></svg>
            {t(language, 'PREV')}
          </button>

          {/* Dot indicators */}
          <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {questions.map((qItem, i) => {
              const r = results.get(qItem.id);
              let color: string = COLORS.gray100;
              if (r) color = r.pass ? '#82a668' : '#d32f2f';
              return (
                <div key={i}
                  onClick={() => setReviewIdx(i)}
                  style={{
                    width: i === reviewIdx ? 20 : 8,
                    height: 8, borderRadius: 4,
                    background: i === reviewIdx ? 'var(--sp-brick,#a85236)' : color,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                />
              );
            })}
          </div>

          <button
            onClick={() => setReviewIdx(i => Math.min(totalQ - 1, i + 1))}
            disabled={reviewIdx === totalQ - 1}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              border: `1.5px solid ${COLORS.gray100}`, background: 'transparent',
              color: reviewIdx === totalQ - 1 ? COLORS.gray100 : COLORS.charcoal,
              fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: 500, cursor: reviewIdx === totalQ - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {t(language, 'NEXT')}
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6" /></svg>
          </button>
        </div>
      </div>
    );
  }

  /* ─── Answering mode ─── */
  const isLastQ = currentIdx === totalQ - 1;
  const splitLayout = isSplitLayout(currentQ);
  const { text: qText, image: qImage } = questionTextFor(currentQ);
  const hasTextOrImg = !!(qText || qImage) && !splitLayout && currentQ.type !== 'ftb';

  const navArrows = (
    <>
      {/* Left Navigation Arrow */}
      <button
        onClick={goPrev}
        disabled={currentIdx === 0}
        style={{
          position: 'absolute', ...(dir === 'rtl' ? { right: 8 } : { left: 8 }), top: '50%', transform: 'translateY(-50%)',
          width: compact ? 34 : 40, height: compact ? 34 : 40, borderRadius: '50%',
          background: currentIdx === 0 ? 'rgba(243,244,246,0.7)' : 'rgba(255,255,255,0.96)',
          color: currentIdx === 0 ? COLORS.gray100 : COLORS.charcoal,
          cursor: currentIdx === 0 ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
          boxShadow: currentIdx === 0 ? 'none' : '0 2px 12px rgba(0,0,0,0.14)', zIndex: 10,
          backdropFilter: 'blur(4px)', transition: 'all 0.15s',
        }}
        aria-label={t(language, 'PREV_QUESTION')}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6" /></svg>
      </button>

      {/* Right Navigation Arrow (Submit / Next) */}
      <button
        onClick={goNext}
        style={{
          position: 'absolute', ...(dir === 'rtl' ? { left: 8 } : { right: 8 }), top: '50%', transform: 'translateY(-50%)',
          width: compact ? 34 : 40, height: compact ? 34 : 40, borderRadius: '50%',
          border: 'none',
          background: isLastQ ? 'var(--sp-brick,#a85236)' : 'rgba(255,255,255,0.96)',
          color: isLastQ ? COLORS.white : COLORS.charcoal,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.14)', zIndex: 10,
          backdropFilter: 'blur(4px)', transition: 'all 0.15s',
        }}
        aria-label={isLastQ ? t(language, 'SUBMIT_ASSESSMENT') : t(language, 'NEXT_QUESTION')}
      >
        {isLastQ ? (
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12" /></svg>
        ) : (
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6" /></svg>
        )}
      </button>
    </>
  );

  /* ─── Split layout (vertical2 / grid2): question left · options right ─── */
  if (splitLayout) {
    const eyebrow = eyebrowFor(currentQ, language);
    return (
      <div ref={wrapRef} className="eq-scale" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: FONT_FAMILY, background: '#faf9f6', position: 'relative', direction: dir }}>
        {navArrows}

        <QuestionHeader q={currentQ} currentIdx={currentIdx} totalQ={totalQ} onMenuOpen={onMenuOpen} compact={compact} language={language} />

        {/* Centered group: question + divider + options (row when wide, stacked when narrow) */}
        <div key={currentQ.id} style={{
          flex: 1, minHeight: 0, overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'safe center', alignItems: 'center',
          padding: `${vPad}px ${GUTTER}px`, boxSizing: 'border-box',
        }}>
          <div style={{
            width: '100%', maxWidth: splitStacked ? MAXW : 1000,
            display: 'flex', flexDirection: splitStacked ? 'column' : 'row',
            gap: splitStacked ? vGap : 36,
            alignItems: splitStacked ? 'stretch' : 'center',
          }}>
            {/* Question */}
            <div style={{
              flex: splitStacked ? '0 0 auto' : '0 0 38%', maxWidth: splitStacked ? '100%' : '38%',
              display: 'flex', flexDirection: 'column',
            }}>
              <span style={{ fontSize: 'var(--eq-fs-eyebrow)', fontWeight: 700, letterSpacing: '0.12em', color: '#b3aaa0', textTransform: 'uppercase' }}>{t(language, 'QUESTION')}</span>
              {qImage && (
                <img src={qImage} alt="question" style={{ maxWidth: compact ? 140 : 160, maxHeight: 'var(--eq-img)', borderRadius: 10, objectFit: 'contain', alignSelf: 'flex-start', marginTop: compact ? 8 : 14 }} />
              )}
              {qText && (
                <h2 className="ecml-qtitle" style={{ fontSize: 'var(--eq-fs-title)', fontWeight: 700, color: COLORS.obsidian, letterSpacing: '-0.01em', lineHeight: 1.3, margin: `${compact ? 8 : 14}px 0 0` }} dangerouslySetInnerHTML={{ __html: qText }} />
              )}
            </div>

            {/* Divider */}
            <div style={{ flexShrink: 0, background: COLORS.gray100, alignSelf: 'stretch', width: splitStacked ? '100%' : 1, height: splitStacked ? 1 : 'auto', minHeight: splitStacked ? 0 : 80 }} />

            {/* Options */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 'var(--eq-fs-eyebrow)', fontWeight: 700, letterSpacing: '0.12em', color: '#c8b8a9', textTransform: 'uppercase' }}>{eyebrow}</span>
              <div style={{ marginTop: short ? 10 : 14 }}>
                {renderQuestion(currentQ, results.get(currentQ.id)?.state, false)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="eq-scale" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: FONT_FAMILY, background: '#faf9f6', position: 'relative', direction: dir }}>
      {navArrows}

      {/* Header — progress bar + counter + type label + menu (+ question when tight) */}
      <QuestionHeader
        q={currentQ}
        currentIdx={currentIdx}
        totalQ={totalQ}
        onMenuOpen={onMenuOpen}
        compact={compact}
        language={language}
        tight={tight}
      />

      {/* Main content — question card + interaction centered together as one group */}
      <div key={currentQ.id} style={{
        flex: 1, minHeight: 0, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-start', alignItems: 'center',
        padding: `${vPad}px ${GUTTER}px`, boxSizing: 'border-box',
      }}>
        <div style={{ width: '100%', maxWidth: MAXW, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: vGap }}>
          {/* When tight (mobile) the question lives in the header row; otherwise the white card here. */}
          {hasTextOrImg && !tight && <QuestionTextCard q={currentQ} compact={compact} language={language} />}
          {/* Options centered in the free space (FTB / no-card → fully centered). */}
          <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'safe center', alignItems: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: compact ? '100%' : 680,
            }}>
              {renderQuestion(currentQ, results.get(currentQ.id)?.state, false)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Submit Confirmation Screen ─── */
interface SubmitConfirmProps {
  totalCount: number;
  answeredCount: number;
  skippedCount: number;
  language: string;
  dir: 'ltr' | 'rtl';
  onReview(): void;
  onSubmit(): void;
}

/* Token overrides for the end screens: raise the desktop CAP (and cqi growth)
   so the screen scales up inside a wide embed, while clamp MINS stay put so the
   mobile size is unchanged. Mirrors EQ_TOKENS_LG in EcmlPlugin. */
const EQ_TOKENS_LG: React.CSSProperties = {
  ['--eq-fs-xl' as string]:      'clamp(20px, 2.7cqi, 34px)',
  ['--eq-fs-option' as string]:  'clamp(15px, 1.7cqi, 22px)',
  ['--eq-fs-label' as string]:   'clamp(12px, 1.3cqi, 17px)',
  ['--eq-fs-eyebrow' as string]: 'clamp(10px, 1cqi, 13px)',
};

const SubmitConfirmScreen: React.FC<SubmitConfirmProps> = ({
  totalCount, answeredCount, skippedCount, language, dir, onReview, onSubmit,
}) => {
  const [wrapRef, compact, short, , coarse] = useCompact();
  /* `compact` (width) drives LAYOUT (stack buttons / full-width / maxWidth).
     `small` (real mobile: coarse touch + narrow OR short) drives SIZE so a
     landscape phone fits the screen without scrolling, matching the Assessment
     Submitted screen. Desktop/collection stay full size. */
  const small = coarse && (compact || short);
  return (
  <div ref={wrapRef} className="eq-scale" style={{
    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
    background: COLORS.white, fontFamily: FONT_FAMILY, overflowY: 'auto', direction: dir,
    ...EQ_TOKENS_LG,
  }}>
    <div style={{
      margin: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%', maxWidth: compact ? 400 : 560,
      padding: small ? '12px 16px' : 'clamp(28px, 4cqi, 52px) 32px',
      gap: small ? 10 : 24, boxSizing: 'border-box',
    }}>
      {/* Warning icon */}
      <div style={{
        width: small ? 34 : 'clamp(52px, 6cqi, 72px)', height: small ? 34 : 'clamp(52px, 6cqi, 72px)', borderRadius: '50%',
        border: `${small ? 2.5 : 3}px solid var(--sp-brick,#a85236)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontSize: small ? 16 : 'clamp(24px, 3cqi, 34px)', color: 'var(--sp-brick,#a85236)', fontWeight: 700, lineHeight: 1 }}>!</span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontSize: 'var(--eq-fs-xl)', fontWeight: 700, color: COLORS.obsidian, margin: small ? '0 0 4px' : '0 0 8px' }}>{t(language, 'READY_SUBMIT')}</h3>
        <p style={{ fontSize: 'var(--eq-fs-label)', color: COLORS.gray500, lineHeight: 1.4, margin: 0 }}>
          {t(language, 'READY_SUBMIT_SUB')}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        background: COLORS.gray50, borderRadius: 12, padding: small ? '10px 12px' : '20px 24px',
        display: 'flex', gap: 0, width: '100%',
      }}>
        <StatItem value={totalCount} label={t(language, 'STAT_TOTAL')} color={COLORS.obsidian} compact={small} />
        <div style={{ width: 1, background: COLORS.gray100 }} />
        <StatItem value={answeredCount} label={t(language, 'STAT_ANSWERED')} color='#2e7d52' compact={small} />
        <div style={{ width: 1, background: COLORS.gray100 }} />
        <StatItem value={skippedCount} label={t(language, 'STAT_SKIPPED')} color={COLORS.gray500} compact={small} />
      </div>

      {/* Buttons — stacking by WIDTH (compact), size by `small` */}
      <div style={{ display: 'flex', flexDirection: compact ? 'column' : 'row', gap: small ? 8 : 14, width: '100%' }}>
        <button onClick={onReview} style={{
          flex: 1, width: compact ? '100%' : 'auto', minHeight: small ? 40 : 'clamp(48px, 5cqi, 60px)', borderRadius: 10,
          border: `1.5px solid ${COLORS.gray100}`, background: 'transparent',
          color: COLORS.charcoal, fontFamily: FONT_FAMILY, fontSize: 'var(--eq-fs-option)', fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap',
          padding: small ? '8px 16px' : 'clamp(10px, 1.4cqi, 16px) clamp(16px, 2cqi, 28px)', boxSizing: 'border-box',
        }}>
          <svg width={small ? 14 : 18} height={small ? 14 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M1,12s4-8,11-8,11,8,11,8-4,8-11,8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {t(language, 'REVIEW_ANSWERS')}
        </button>
        <button onClick={onSubmit} style={{
          flex: 1, width: compact ? '100%' : 'auto', minHeight: small ? 40 : 'clamp(48px, 5cqi, 60px)', borderRadius: 10, border: 'none',
          background: 'var(--sp-brick,#a85236)', color: COLORS.white,
          fontFamily: FONT_FAMILY, fontSize: 'var(--eq-fs-option)', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap',
          padding: small ? '8px 16px' : 'clamp(10px, 1.4cqi, 16px) clamp(16px, 2cqi, 28px)', boxSizing: 'border-box',
        }}>
          {t(language, 'SUBMIT_ASSESSMENT_BTN')} →
        </button>
      </div>
    </div>
  </div>
  );
};

const StatItem: React.FC<{ value: number; label: string; color: string; compact?: boolean }> = ({ value, label, color, compact = false }) => (
  <div style={{ flex: 1, textAlign: 'center' }}>
    <p style={{ fontSize: 'var(--eq-fs-xl)', fontWeight: 700, color, marginBottom: compact ? 2 : 4, lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: 'var(--eq-fs-eyebrow)', fontWeight: 700, letterSpacing: '0.06em', color: COLORS.gray400, textTransform: 'uppercase' }}>{label}</p>
  </div>
);

export default QuestionSet;
