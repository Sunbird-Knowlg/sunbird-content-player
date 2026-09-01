import React from 'react';
import type { McqData, McqConfig, McqAnswerState, McqOption } from '../ecml.types';
import { COLORS, FONT_FAMILY } from '../../../constants';

interface Props {
  data: McqData;
  config: McqConfig;
  reviewState?: McqAnswerState;
  isReview?: boolean;
  compact?: boolean;
  onAnswer(state: McqAnswerState, score: number, maxScore: number, pass: boolean): void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const BRICK = 'var(--sp-brick,#a85236)';
const GREEN = '#82a668';
const RED = '#d32f2f';

/* ─── Visual state per option ─── */
interface OptStyle {
  bg: string; border: string; badgeBg: string; badgeColor: string;
  textColor: string; fw: number;
  isSel: boolean; isCorrect: boolean; isWrong: boolean;
}

function optStyle(idx: number, selected: number | null, isReview: boolean, options: McqOption[]): OptStyle {
  const isSel = selected === idx;
  const opt = options[idx];
  const isCorrect = isReview && !!opt.isCorrect;
  const isWrong = isReview && isSel && !opt.isCorrect;

  let bg: string = COLORS.white;
  let border: string = `1.5px solid ${COLORS.gray100}`;
  let badgeBg: string = '#f5f1ee';
  let badgeColor: string = COLORS.gray500;
  let textColor: string = COLORS.obsidian;
  let fw = 500;

  if (isCorrect) {
    bg = '#f0f7ed'; border = `2px solid ${GREEN}`; badgeBg = GREEN; badgeColor = COLORS.white; textColor = '#4a7a5a'; fw = 600;
  } else if (isWrong) {
    bg = '#fdf2f2'; border = `2px solid ${RED}`; badgeBg = RED; badgeColor = COLORS.white; textColor = '#c0324a'; fw = 600;
  } else if (isReview) {
    bg = '#fafafa'; border = '1.5px solid #f0f0f0';
    badgeBg = '#f0f0f0'; badgeColor = '#bbb';
    textColor = '#bbb'; fw = 400;
  } else if (isSel) {
    bg = '#fdf5f3'; border = `2px solid ${BRICK}`; badgeBg = BRICK; badgeColor = COLORS.white; textColor = BRICK; fw = 600;
  }

  return { bg, border, badgeBg, badgeColor, textColor, fw, isSel, isCorrect, isWrong };
}

const Badge: React.FC<{ s: OptStyle; idx: number; size?: number | string }> = ({ s, idx, size }) => {
  const dim = size === undefined ? 'var(--eq-badge)' : typeof size === 'number' ? `${size}px` : size;
  return (
  <div style={{
    width: dim, height: dim, borderRadius: `calc(${dim} * 0.27)`, background: s.badgeBg, color: s.badgeColor,
    fontWeight: 700, fontSize: `calc(${dim} * 0.42)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }}>{LABELS[idx] ?? idx + 1}</div>
  );
};

const Check: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="4 12 9 18 20 6" /></svg>
);
const Cross: React.FC = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const StateIcon: React.FC<{ s: OptStyle }> = ({ s }) => s.isCorrect ? <Check /> : s.isWrong ? <Cross /> : null;

const HOVER = '0 4px 16px rgba(0,0,0,0.10)';

type LayoutProps = {
  options: McqOption[];
  selected: number | null;
  isReview: boolean;
  compact: boolean;
  onSelect(i: number): void;
};

/*
 * Two discrete style sets per layout, switched by `compact` (container width < 600px).
 * Desktop (compact=false) = original large values — pixel-identical to the approved design.
 * Mobile  (compact=true)  = reduced values that fit small viewports.
 */

/* ─── 1. imageGrid — always 2-col grid (image-friendly) ─── */
const ImageGridLayout: React.FC<LayoutProps> = ({ options, selected, isReview, compact, onSelect }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    gridAutoRows: compact ? 'minmax(48px, 76px)' : 'minmax(64px, 130px)', gap: compact ? 6 : 10, alignContent: 'safe center',
  }}>
    {options.map((opt, idx) => {
      const s = optStyle(idx, selected, isReview, options);
      return (
        <div key={idx} role="radio" aria-checked={s.isSel} tabIndex={isReview ? -1 : 0} className={isReview ? undefined : "eq-opt"}
          onClick={() => onSelect(idx)}
          onMouseEnter={e => { if (!isReview) (e.currentTarget.style.boxShadow = HOVER); }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          style={{ background: s.bg, border: s.border, borderRadius: 14, overflow: 'hidden', cursor: isReview ? 'default' : 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column' }}>
          {opt.image && (
            <div style={{ position: 'relative', background: COLORS.gray50, flex: 1, minHeight: 0 }}>
              <img src={opt.image} alt="" style={{ width: '100%', height: '100%', maxHeight: compact ? 90 : 140, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', top: 8, left: 8 }}><Badge s={s} idx={idx} /></div>
            </div>
          )}
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, minHeight: 0 }}>
            {!opt.image && <Badge s={s} idx={idx} />}
            <span style={{ fontSize: 'clamp(14px, 1.3cqi, 16px)', fontWeight: s.fw, color: s.textColor, flex: 1, lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: opt.text ?? '' }} />
            <StateIcon s={s} />
          </div>
        </div>
      );
    })}
  </div>
);

/* ─── 2. vertical → horizontal square cards ─── */
const SquareCardsLayout: React.FC<LayoutProps> = ({ options, selected, isReview, compact, onSelect }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: compact ? 8 : 16, alignContent: 'safe center' }}>
    {options.map((opt, idx) => {
      const s = optStyle(idx, selected, isReview, options);
      return (
        <div key={idx} role="radio" aria-checked={s.isSel} tabIndex={isReview ? -1 : 0} className={isReview ? undefined : "eq-opt"}
          onClick={() => onSelect(idx)}
          onMouseEnter={e => { if (!isReview) e.currentTarget.style.boxShadow = HOVER; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          style={{ flex: compact ? '1 1 84px' : '1 1 200px', minWidth: compact ? 72 : 150, maxWidth: compact ? 140 : 320, minHeight: 'clamp(68px, 14cqi, 180px)', maxHeight: '100%', background: s.bg, border: s.border, borderRadius: 18, padding: 'clamp(8px, 2.4cqi, 24px)', cursor: isReview ? 'default' : 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'clamp(5px, 1.1cqi, 12px)', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Badge s={s} idx={idx} />
          {opt.image && <img src={opt.image} alt="" style={{ maxWidth: '100%', maxHeight: 'clamp(44px, 9cqi, 96px)', borderRadius: 8, objectFit: 'contain' }} />}
          {opt.text && <span style={{ fontSize: 'clamp(15px, 1.8cqi, 22px)', fontWeight: 700, color: s.textColor }} dangerouslySetInnerHTML={{ __html: opt.text }} />}
          <StateIcon s={s} />
        </div>
      );
    })}
  </div>
);

/* ─── 3. vertical2 — vertical list (content-height; question lives in shell) ─── */
const Vertical2Layout: React.FC<LayoutProps> = ({ options, selected, isReview, compact, onSelect }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 10 : 14 }}>
    {options.map((opt, idx) => {
      const s = optStyle(idx, selected, isReview, options);
      return (
        <div key={idx} role="radio" aria-checked={s.isSel} tabIndex={isReview ? -1 : 0} className={isReview ? undefined : "eq-opt"}
          onClick={() => onSelect(idx)}
          onMouseEnter={e => { if (!isReview) e.currentTarget.style.boxShadow = HOVER; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          style={{ background: s.bg, border: s.border, borderRadius: 16, padding: 'clamp(10px, 1.4cqi, 16px) clamp(14px, 2.2cqi, 24px)', display: 'flex', alignItems: 'center', gap: compact ? 10 : 18, cursor: isReview ? 'default' : 'pointer', transition: 'all 0.15s', minHeight: 'clamp(44px, 5cqi, 60px)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <Badge s={s} idx={idx} />
          <span style={{ flex: 1, fontSize: 'clamp(14px, 1.4cqi, 17px)', fontWeight: s.fw, color: s.textColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: opt.text ?? '' }} />
          {opt.image && <img src={opt.image} alt="" style={{ maxHeight: 'clamp(36px, 5cqi, 56px)', borderRadius: 6 }} />}
          <StateIcon s={s} />
        </div>
      );
    })}
  </div>
);

/* ─── 4. grid2 — 2-col grid (content-height; question lives in shell) ─── */
const Grid2Layout: React.FC<LayoutProps> = ({ options, selected, isReview, compact, onSelect }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: compact ? 'minmax(56px, auto)' : 'minmax(96px, auto)', gap: compact ? 8 : 14 }}>
    {options.map((opt, idx) => {
      const s = optStyle(idx, selected, isReview, options);
      return (
        <div key={idx} role="radio" aria-checked={s.isSel} tabIndex={isReview ? -1 : 0} className={isReview ? undefined : "eq-opt"}
          onClick={() => onSelect(idx)}
          onMouseEnter={e => { if (!isReview) e.currentTarget.style.boxShadow = HOVER; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          style={{ background: s.bg, border: s.border, borderRadius: 16, padding: 'clamp(10px, 1.8cqi, 20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: compact ? 6 : 12, cursor: isReview ? 'default' : 'pointer', transition: 'all 0.15s', textAlign: 'center', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          <Badge s={s} idx={idx} />
          {opt.image && <img src={opt.image} alt="" style={{ maxWidth: '100%', maxHeight: 'clamp(40px, 6cqi, 72px)', borderRadius: 6, objectFit: 'contain' }} />}
          {opt.text && <span style={{ fontSize: 'clamp(15px, 1.6cqi, 20px)', fontWeight: s.fw, color: s.textColor }} dangerouslySetInnerHTML={{ __html: opt.text }} />}
          <StateIcon s={s} />
        </div>
      );
    })}
  </div>
);

/* ─── 5. grid — scattered tiles ─── */
const ScatteredLayout: React.FC<LayoutProps> = ({ options, selected, isReview, compact, onSelect }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(min(100%,${compact ? 110 : 180}px), 1fr))`, gridAutoRows: compact ? 'minmax(54px, 84px)' : 'minmax(120px, 180px)', gap: compact ? 6 : 14, alignContent: 'safe center' }}>
    {options.map((opt, idx) => {
      const s = optStyle(idx, selected, isReview, options);
      return (
        <div key={idx} role="radio" aria-checked={s.isSel} tabIndex={isReview ? -1 : 0} className={isReview ? undefined : "eq-opt"}
          onClick={() => onSelect(idx)}
          onMouseEnter={e => { if (!isReview) e.currentTarget.style.boxShadow = HOVER; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          style={{ background: s.bg, border: s.border, borderRadius: 16, padding: 'clamp(12px, 2cqi, 24px) clamp(12px, 1.7cqi, 20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? 8 : 14, cursor: isReview ? 'default' : 'pointer', transition: 'all 0.15s', textAlign: 'center', minHeight: 0, overflow: 'hidden', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
          <Badge s={s} idx={idx} />
          {opt.image && <img src={opt.image} alt="" style={{ maxWidth: '100%', maxHeight: 'clamp(44px, 6.5cqi, 80px)', borderRadius: 6, objectFit: 'contain' }} />}
          {opt.text && <span style={{ fontSize: 'clamp(14px, 1.55cqi, 19px)', fontWeight: s.fw, color: s.textColor, lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: opt.text }} />}
          <StateIcon s={s} />
        </div>
      );
    })}
  </div>
);

/* ─── 6. imageHorizontal — wrapping image+text cards ─── */
const HorizontalRowLayout: React.FC<LayoutProps> = ({ options, selected, isReview, compact, onSelect }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: compact ? 8 : 16, alignContent: 'safe center' }}>
    {options.map((opt, idx) => {
      const s = optStyle(idx, selected, isReview, options);
      return (
        <div key={idx} role="radio" aria-checked={s.isSel} tabIndex={isReview ? -1 : 0} className={isReview ? undefined : "eq-opt"}
          onClick={() => onSelect(idx)}
          onMouseEnter={e => { if (!isReview) e.currentTarget.style.boxShadow = HOVER; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          style={{ flex: compact ? '1 1 100px' : '1 1 200px', minWidth: compact ? 88 : 150, maxWidth: compact ? 180 : 360, minHeight: 'clamp(84px, 17cqi, 220px)', maxHeight: '100%', background: s.bg, border: s.border, borderRadius: 16, padding: 'clamp(10px, 2cqi, 24px) clamp(10px, 1.7cqi, 20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: compact ? 6 : 14, cursor: isReview ? 'default' : 'pointer', transition: 'all 0.15s', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Badge s={s} idx={idx} />
          {opt.image && <img src={opt.image} alt="" style={{ maxWidth: '100%', maxHeight: 'clamp(60px, 9cqi, 120px)', borderRadius: 8, objectFit: 'contain' }} />}
          {opt.text && <span style={{ fontSize: 'clamp(15px, 1.6cqi, 20px)', fontWeight: 700, color: s.textColor }} dangerouslySetInnerHTML={{ __html: opt.text }} />}
          <StateIcon s={s} />
        </div>
      );
    })}
  </div>
);

/* ─── 7. horizontal — full-width vertical list ─── */
const FullWidthListLayout: React.FC<LayoutProps> = ({ options, selected, isReview, compact, onSelect }) => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'safe center', gap: compact ? 8 : 16 }}>
    {options.map((opt, idx) => {
      const s = optStyle(idx, selected, isReview, options);
      return (
        <div key={idx} role="radio" aria-checked={s.isSel} tabIndex={isReview ? -1 : 0} className={isReview ? undefined : "eq-opt"}
          onClick={() => onSelect(idx)}
          onMouseEnter={e => { if (!isReview) e.currentTarget.style.boxShadow = HOVER; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = s.isSel || s.isCorrect || s.isWrong ? 'none' : '0 2px 8px rgba(0,0,0,0.06)'; }}
          style={{
            background: s.bg, border: s.border, borderRadius: 16,
            padding: compact ? '9px 14px' : 'clamp(12px, 1.7cqi, 22px) clamp(16px, 2.4cqi, 32px)',
            display: 'flex', alignItems: 'center', gap: compact ? 12 : 20,
            cursor: isReview ? 'default' : 'pointer', transition: 'all 0.15s',
            minHeight: compact ? 46 : 'clamp(52px, 6cqi, 84px)', boxSizing: 'border-box',
            boxShadow: s.isSel || s.isCorrect || s.isWrong ? undefined : '0 2px 8px rgba(0,0,0,0.06)',
          }}>
          <Badge s={s} idx={idx} />
          {opt.image && <img src={opt.image} alt="" style={{ maxHeight: 'clamp(36px, 4.5cqi, 64px)', borderRadius: 6 }} />}
          <span style={{ flex: 1, fontSize: 'clamp(16px, 1.6cqi, 22px)', fontWeight: s.fw, color: s.textColor, lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: opt.text ?? '' }} />
          <StateIcon s={s} />
        </div>
      );
    })}
  </div>
);

/* ─── McqQuestion ─── */
const McqQuestion: React.FC<Props> = ({ data, config, reviewState, isReview = false, compact = false, onAnswer }) => {
  const maxScore = config.max_score ?? 1;
  const layout = (config.layout ?? 'Vertical').toLowerCase();

  const [options, setOptions] = React.useState(() => {
    if (reviewState) return reviewState.options;
    return config.isShuffleOption ? shuffleArray(data.options) : [...data.options];
  });
  const [selected, setSelected] = React.useState<number | null>(
    reviewState ? reviewState.selectedIndex : null,
  );

  React.useEffect(() => {
    if (reviewState) {
      setOptions(reviewState.options);
      setSelected(reviewState.selectedIndex);
    }
  }, [reviewState]);

  const handleSelect = (idx: number) => {
    if (isReview) return;
    setSelected(idx);
    const opt = options[idx];
    const pass = !!opt.isCorrect;
    onAnswer({ type: 'mcq', selectedIndex: idx, options }, pass ? maxScore : 0, maxScore, pass);
  };

  const lp: LayoutProps = { options, selected, isReview, compact, onSelect: handleSelect };

  return (
    <div style={{ fontFamily: FONT_FAMILY, width: '100%', display: 'flex', flexDirection: 'column' }}>
      {layout === 'imagegrid' && <ImageGridLayout {...lp} />}
      {layout === 'vertical' && <SquareCardsLayout {...lp} />}
      {layout === 'vertical2' && <Vertical2Layout {...lp} />}
      {layout === 'grid2' && <Grid2Layout {...lp} />}
      {layout === 'grid' && <ScatteredLayout {...lp} />}
      {layout === 'imagehorizontal' && <HorizontalRowLayout {...lp} />}
      {layout === 'horizontal' && <FullWidthListLayout {...lp} />}
      {!['imagegrid', 'vertical', 'vertical2', 'grid2', 'grid', 'imagehorizontal', 'horizontal'].includes(layout) && (
        <FullWidthListLayout {...lp} />
      )}
    </div>
  );
};

export default McqQuestion;
