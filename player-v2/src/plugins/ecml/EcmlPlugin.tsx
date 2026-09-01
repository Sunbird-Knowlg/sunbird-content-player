import React from 'react';
import type { ContentPluginProps, ContentPluginRef } from '../plugin.interface';
import type { PluginDefinition } from '../plugin.interface';
import type { EcmlQuestion, EcmlSlide, EcmlContent } from './ecml.types';
import type { QuestionSetScore } from './QuestionSet';

import { COLORS, FONT_FAMILY } from '../../constants';
import { fetchEcmlBody, parseEcmlContent, parseInlineBody } from './ecml.parser';
import { useIsTouch } from '../../hooks/useIsTouch';
import QuestionSet from './QuestionSet';
import EcmlSlideRenderer from './EcmlSlideRenderer';
import Menu from '../../menu/Menu';
import { t } from '../../i18n/i18n';

type LoadState = 'loading' | 'error' | 'ready' | 'finished';

/* ─── Score display after review ─── */
interface ScoreCircleProps {
  score: number;
  maxScore: number;
  language: string;
}

/* Token overrides for the end screens: raise the desktop CAP (and cqi growth)
   so the summary scales up inside a wide collection embed, while the clamp MINS
   stay put so the mobile size is unchanged. */
const EQ_TOKENS_LG: React.CSSProperties = {
  ['--eq-fs-xl' as string]:      'clamp(20px, 2.7cqi, 34px)',
  ['--eq-fs-option' as string]:  'clamp(15px, 1.7cqi, 22px)',
  ['--eq-fs-label' as string]:   'clamp(12px, 1.3cqi, 17px)',
  ['--eq-fs-eyebrow' as string]: 'clamp(10px, 1cqi, 13px)',
};

const ScoreCircle: React.FC<ScoreCircleProps> = ({ score, maxScore, language }) => {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  /* Fully fluid: the SVG width is a clamp(cqi) that resolves against the player
     (.eq-scale) container, so the circle scales proportionally for ANY player
     size — mobile, collection embed, or large standalone — with no breakpoints.
     A viewBox keeps the ring + % text scaling together inside it. */
  const VB = 100;
  const stroke = 6;                 // in viewBox units (~6% ring)
  const r = (VB - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(4px, 1cqi, 10px)' }}>
      <svg viewBox={`0 0 ${VB} ${VB}`} style={{ width: 'clamp(96px, 17cqi, 200px)', height: 'auto', transform: 'rotate(-90deg)' }}>
        <circle cx={VB / 2} cy={VB / 2} r={r} fill="none" stroke={COLORS.gray100} strokeWidth={stroke} />
        <circle cx={VB / 2} cy={VB / 2} r={r} fill="none"
          stroke="var(--sp-brick,#a85236)" strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x={VB / 2} y={VB / 2}
          textAnchor="middle" dominantBaseline="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: `${VB / 2}px ${VB / 2}px`, fontSize: 24 }}
          fill={COLORS.obsidian} fontWeight={700} fontFamily={FONT_FAMILY}
        >
          {pct}%
        </text>
      </svg>
      <span style={{ fontSize: 'var(--eq-fs-label)', color: COLORS.gray500, textAlign: 'center' }}>
        {pct >= 70 ? t(language, 'SCORE_GREAT') : pct >= 40 ? t(language, 'SCORE_KEEP') : t(language, 'SCORE_MORE')}
      </span>
    </div>
  );
};

/* ─── Assessment summary shown after QuestionSet is done ─── */
interface AssessmentSummaryProps {
  score: QuestionSetScore;
  contentName: string;
  compact?: boolean;
  language: string;
  onRedo(): void;
  onClose(): void;
}

const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({
  score, contentName, compact = false, language, onRedo, onClose,
}) => {
  /* Mobile keeps the tight fixed values; desktop sizing is FLUID (clamp/cqi) so
     it scales smoothly across the collection embed AND the large standalone —
     no breakpoints (which kept mismatching the two). */
  const s = compact
    ? { pad: '12px 16px', btnH: 42 as number | string }
    : { pad: 'clamp(20px, 3.5cqi, 56px) clamp(20px, 3cqi, 40px)', btnH: 'clamp(48px, 5cqi, 60px)' as number | string };
  const colMaxW = compact ? 440 : 'min(90%, 720px)';
  const colGap = compact ? 10 : 'clamp(16px, 2.4cqi, 28px)';

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: COLORS.white, fontFamily: FONT_FAMILY, padding: s.pad, zIndex: 10,
      overflowY: 'auto',
      ...EQ_TOKENS_LG,
    }}
      className="sp-fade-in eq-scale"
    >
      {/* Content column — width + gap fluid so it fills any player size. */}
      <div style={{
        margin: 'auto', width: '100%', maxWidth: colMaxW,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: colGap, boxSizing: 'border-box',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--eq-fs-xl)', fontWeight: 700, color: COLORS.obsidian, margin: compact ? '0 0 2px' : '0 0 4px' }}>
            {t(language, 'ASSESS_SUBMITTED')}
          </h2>
          <p style={{ fontSize: 'var(--eq-fs-label)', color: COLORS.gray500, margin: 0, lineHeight: 1.4 }}>
            {contentName}
          </p>
        </div>

        <ScoreCircle score={score.totalScore} maxScore={score.maxScore} language={language} />

        {/* Stats — full width, 3 equal columns (matches Ready-to-submit) */}
        <div style={{
          display: 'flex', gap: 0, width: '100%',
          padding: compact ? '10px 12px' : '20px 24px', borderRadius: 12,
          background: COLORS.gray50, border: `1px solid ${COLORS.gray100}`,
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--eq-fs-xl)', fontWeight: 700, color: COLORS.obsidian, margin: 0, lineHeight: 1 }}>{score.totalScore}</p>
            <p style={{ fontSize: 'var(--eq-fs-eyebrow)', fontWeight: 700, color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '4px 0 0' }}>{t(language, 'STAT_SCORE')}</p>
          </div>
          <div style={{ width: 1, background: COLORS.gray100 }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--eq-fs-xl)', fontWeight: 700, color: COLORS.obsidian, margin: 0, lineHeight: 1 }}>{score.maxScore}</p>
            <p style={{ fontSize: 'var(--eq-fs-eyebrow)', fontWeight: 700, color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '4px 0 0' }}>{t(language, 'STAT_TOTAL')}</p>
          </div>
          <div style={{ width: 1, background: COLORS.gray100 }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--eq-fs-xl)', fontWeight: 700, color: '#2e7d52', margin: 0, lineHeight: 1 }}>{score.answeredCount}</p>
            <p style={{ fontSize: 'var(--eq-fs-eyebrow)', fontWeight: 700, color: COLORS.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '4px 0 0' }}>{t(language, 'STAT_ANSWERED')}</p>
          </div>
        </div>

        {/* Buttons — full width row (matches Ready-to-submit) */}
        <div style={{ display: 'flex', gap: compact ? 8 : 14, width: '100%' }}>
          <button onClick={onRedo} style={{
            flex: 1, minHeight: s.btnH, borderRadius: 10,
            border: `1.5px solid ${COLORS.gray100}`, background: 'transparent',
            color: COLORS.charcoal, fontFamily: FONT_FAMILY, fontSize: 'var(--eq-fs-option)', fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, whiteSpace: 'nowrap',
            padding: compact ? '8px 16px' : 'clamp(10px, 1.4cqi, 16px) clamp(16px, 2cqi, 28px)', boxSizing: 'border-box',
          }}>
            <svg width={compact ? 14 : 18} height={compact ? 14 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="1,4 1,10 7,10"/><path d="M3.51,15a9,9,0,1,0,.49-3.5"/></svg>
            {t(language, 'REDO')}
          </button>
          <button onClick={onClose} style={{
            flex: 1, minHeight: s.btnH, borderRadius: 10, border: 'none',
            background: 'var(--sp-brick,#a85236)', color: COLORS.white,
            fontFamily: FONT_FAMILY, fontSize: 'var(--eq-fs-option)', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap',
            padding: compact ? '8px 16px' : 'clamp(10px, 1.4cqi, 16px) clamp(16px, 2cqi, 28px)', boxSizing: 'border-box',
          }}>
            {t(language, 'CLOSE')}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Slide navigation controls ─── */
interface SlideNavProps {
  current: number;
  total: number;
  onPrev(): void;
  onNext(): void;
  compact: boolean;
  isTouch?: boolean;
  language: string;
  dir: 'ltr' | 'rtl';
}

const SlideNav: React.FC<SlideNavProps> = ({ current, total, onPrev, onNext, compact, isTouch, language, dir }) => {
  // Tap targets: ≥44px hit area on touch, matches QuestionSet's side arrows on web.
  const btn = isTouch ? 44 : (compact ? 34 : 40);
  const isFirst = current <= 0;
  const isLast = current >= total - 1;
  const sideArrow: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: btn, height: btn, borderRadius: '50%', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.14)', zIndex: 10,
    backdropFilter: 'blur(4px)', transition: 'all 0.15s',
  };
  return (
  <>
    {/* Prev — edge-anchored; in RTL it sits on the right instead of the left */}
    <button
      onClick={onPrev}
      disabled={isFirst}
      aria-label={t(language, 'PREVIOUS')}
      style={{
        ...sideArrow, ...(dir === 'rtl' ? { right: 8 } : { left: 8 }),
        background: isFirst ? 'rgba(243,244,246,0.7)' : 'rgba(255,255,255,0.96)',
        color: isFirst ? COLORS.gray100 : COLORS.charcoal,
        cursor: isFirst ? 'default' : 'pointer',
        boxShadow: isFirst ? 'none' : '0 2px 12px rgba(0,0,0,0.14)',
      }}
    >
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>
    </button>

    {/* Next / Finish on last slide — in RTL it sits on the left instead of the right */}
    <button
      onClick={onNext}
      aria-label={isLast ? t(language, 'FINISH') : t(language, 'NEXT')}
      style={{
        ...sideArrow, ...(dir === 'rtl' ? { left: 8 } : { right: 8 }),
        background: isLast ? 'var(--sp-brick,#a85236)' : 'rgba(255,255,255,0.96)',
        color: isLast ? COLORS.white : COLORS.charcoal,
        cursor: 'pointer',
      }}
    >
      {isLast
        ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
        : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6"/></svg>}
    </button>

    {/* Page indicator — small pill at bottom center (page count, not nav) */}
    <div style={{
      position: 'absolute', bottom: compact ? 8 : 12, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: compact ? '3px 12px' : '4px 14px',
      color: 'white', fontSize: compact ? 11 : 13, fontFamily: FONT_FAMILY, zIndex: 10,
    }}>
      {current + 1} / {total}
    </div>
  </>
  );
};

/* ─── EcmlPlugin ─── */
const EcmlPlugin = React.forwardRef<ContentPluginRef, ContentPluginProps>(
  ({ contentData, language, dir, onReady, onFinished, onError, onInteract, onReplay, onMuteToggle, onExit }, ref) => {
    const isTouch = useIsTouch();
    const [loadState, setLoadState] = React.useState<LoadState>('loading');
    /* Bumped on replay/redo to force a fresh QuestionSet mount (resets currentIdx/results/mode). */
    const [runId, setRunId] = React.useState(0);
    const [content, setContent] = React.useState<EcmlContent | null>(null);
    const [slideIndex, setSlideIndex] = React.useState(0);
    const [score, setScore] = React.useState<QuestionSetScore | null>(null);
    const [compact, setCompact] = React.useState(false);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    React.useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const obs = new ResizeObserver(entries => {
        const w = entries[0]?.contentRect.width ?? 999;
        const h = entries[0]?.contentRect.height ?? 999;
        // Short height only forces compact on non-desktop widths (see useCompact).
        setCompact(w < 640 || (h < 600 && w < 1024));
      });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);

    React.useEffect(() => {
      let cancelled = false;
      setLoadState('loading');
      setSlideIndex(0);
      setScore(null);

      (async () => {
        try {
          let body = parseInlineBody(contentData.body);
          if (!body) {
            const url = contentData.streamingUrl || contentData.artifactUrl;
            if (url) body = await fetchEcmlBody(url);
          }
          if (cancelled) return;
          if (!body) {
            setLoadState('error');
            onError?.('Failed to load ECML content');
            return;
          }
          const parsed = parseEcmlContent(body);
          if (cancelled) return;

          // Validate: slides mode must have at least 1 slide
          if (parsed.mode === 'slides' && parsed.slides.length === 0) {
            setLoadState('error');
            onError?.('No stages found in ECML content');
            return;
          }
          // Questions mode must have at least 1 question
          if (parsed.mode === 'questions' && parsed.questions.length === 0) {
            setLoadState('error');
            onError?.('No questions found in ECML content');
            return;
          }

          setContent(parsed);
          setLoadState('ready');
          onReady();
        } catch (err) {
          if (cancelled) return;
          setLoadState('error');
          onError?.(`ECML load error: ${String((err as Error)?.message ?? err)}`);
        }
      })();

      return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentData.artifactUrl, contentData.streamingUrl]);

    React.useImperativeHandle(ref, () => ({
      replay() {
        setScore(null);
        setSlideIndex(0);
        setRunId(n => n + 1);
        setLoadState('ready');
        /* Re-fire onReady so the shell switches back from its EndScreen to
           'playing' and starts a fresh session (START + heartbeat) — matches
           PDF/EPUB/Video replay(). Without this, slides/resources content
           (which ends via the shell EndScreen) would reset internally but the
           shell would stay on 'finished', leaving the replay button dead.
           (Questions mode replays via its own AssessmentSummary overlay, but
           re-firing onReady there is harmless/idempotent.) */
        onReady();
      },
      mute() {},
    }));

    const currentSlides: EcmlSlide[] = content?.mode === 'slides' ? content.slides : [];
    const currentSlide: EcmlSlide | null = currentSlides[slideIndex] ?? null;
    const currentQuestions: EcmlQuestion[] = content?.mode === 'questions'
      ? content.questions
      : (currentSlide?.questions ?? []);

    const handleSlideNext = () => {
      const isLast = slideIndex >= currentSlides.length - 1;
      if (!isLast) {
        const next = slideIndex + 1;
        setSlideIndex(next);
        onInteract?.('PAGE_CHANGE', { page: next + 1 });
      } else {
        // Last slide — fire finished
        onFinished();
      }
    };

    const handleSlidePrev = () => {
      if (slideIndex > 0) {
        const prev = slideIndex - 1;
        setSlideIndex(prev);
        onInteract?.('PAGE_CHANGE', { page: prev + 1 });
      }
    };

    const handleComplete = (finalScore: QuestionSetScore) => {
      setScore(finalScore);
      setLoadState('finished');
      onInteract?.('ASSESS_SUBMIT', {
        score: finalScore.totalScore,
        maxScore: finalScore.maxScore,
        answered: finalScore.answeredCount,
        skipped: finalScore.skippedCount,
      });
    };

    const handleAssess = (data: {
      questionId: string;
      type: EcmlQuestion['type'];
      score: number;
      maxScore: number;
      pass: boolean;
      index: number;
      resvalues?: Array<Record<string, unknown>>;
    }) => {
      onInteract?.('ASSESS', {
        questionId: data.questionId,
        qtype:      data.type,
        index:      data.index,
        score:      data.score,
        maxScore:   data.maxScore,
        pass:       data.pass,
        resvalues:  data.resvalues,
      });
    };

    // Play audio for current slide
    React.useEffect(() => {
      if (!currentSlide) return;
      const audioEl = currentSlide.elements.find(e => e._type === 'audio' && (e as { src?: string }).src);
      if (!audioEl) return;
      const src = (audioEl as { src?: string }).src;
      if (!src) return;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = src;
        audioRef.current.play().catch(() => {});
      }
    }, [currentSlide]);

    return (
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: COLORS.white, direction: dir }}>
        {/* Hidden audio element for slide audio */}
        <audio ref={audioRef} style={{ display: 'none' }} />

        {/* Loading */}
        {loadState === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.white }}>
            <div style={{ textAlign: 'center', fontFamily: FONT_FAMILY }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${COLORS.gray100}`, borderTopColor: 'var(--sp-brick,#a85236)', borderRadius: '50%', animation: 'sp-spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: COLORS.gray500, fontSize: 14 }}>{t(language, 'LOADING_CONTENT')}</p>
            </div>
          </div>
        )}

        {/* Error */}
        {loadState === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.white, fontFamily: FONT_FAMILY }}>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <p style={{ fontSize: 16, color: COLORS.gray700, marginBottom: 8 }}>{t(language, 'LOAD_FAILED')}</p>
              <p style={{ fontSize: 13, color: COLORS.gray400 }}>{t(language, 'LOAD_FAILED_SUB')}</p>
            </div>
          </div>
        )}

        {/* Slide mode */}
        {loadState === 'ready' && content?.mode === 'slides' && currentSlide && (
          <>
            {/* Aspect-ratio-locked stage: ECML stages are always 16:9 (or fill available space) */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#222',
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}>
                <EcmlSlideRenderer slide={currentSlide} />

                {/* Slide questions (if this stage has embedded question-sets) */}
                {currentSlide.questions.length > 0 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.95)', zIndex: 5 }}>
                    <QuestionSet
                      questions={currentSlide.questions}
                      language={language}
                      dir={dir}
                      onComplete={handleComplete}
                      onAssess={handleAssess}
                      onNavigate={(index) => onInteract?.('PAGE_CHANGE', { page: index })}
                      onMenuOpen={() => setMenuOpen(true)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Navigation — only show if no inline questions */}
            {currentSlide.questions.length === 0 && (
              <SlideNav
                current={slideIndex}
                total={currentSlides.length}
                onPrev={handleSlidePrev}
                onNext={handleSlideNext}
                compact={compact}
                isTouch={isTouch}
                language={language}
                dir={dir}
              />
            )}
          </>
        )}

        {/* Question-only mode */}
        {loadState === 'ready' && content?.mode === 'questions' && (
          <QuestionSet
            key={runId}
            questions={currentQuestions}
            language={language}
            dir={dir}
            onComplete={handleComplete}
            onAssess={handleAssess}
            onNavigate={(index) => onInteract?.('PAGE_CHANGE', { page: index })}
            onMenuOpen={() => setMenuOpen(true)}
          />
        )}

        {/* Inline menu */}
        {menuOpen && (
          <Menu
            title={contentData.name}
            language={language ?? 'en'}
            isMuted={false}
            isVideo={false}
            onReplay={onReplay || (() => {})}
            onMuteToggle={onMuteToggle || (() => {})}
            onExit={onExit || (() => {})}
            onClose={() => setMenuOpen(false)}
            hideToggleBtn={true}
          />
        )}

        {/* Assessment summary */}
        {loadState === 'finished' && score && (
          <AssessmentSummary
            score={score}
            contentName={contentData.name}
            compact={compact}
            language={language}
            onRedo={() => { setScore(null); setRunId(n => n + 1); setLoadState('ready'); }}
            /* AssessmentSummary IS the ECML completion page — Close exits the
               player directly. Do NOT route to onFinished (that shows the shell's
               generic "You just completed" EndScreen → redundant double-end). */
            onClose={onExit ?? onFinished}
          />
        )}
      </div>
    );
  },
);

EcmlPlugin.displayName = 'EcmlPlugin';

export const ECML_PLUGIN_DEFINITION: PluginDefinition = {
  mimeTypes: ['application/vnd.ekstep.ecml-archive'],
  component: EcmlPlugin,
};

export default EcmlPlugin;
