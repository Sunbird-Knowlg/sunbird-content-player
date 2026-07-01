import React from 'react';
import type { SeqData, SeqConfig, SeqAnswerState, SeqOption } from '../ecml.types';
import { COLORS, FONT_FAMILY } from '../../../constants';
import { usePointerDrag } from '../usePointerDrag';

interface Props {
  data: SeqData;
  config: SeqConfig;
  reviewState?: SeqAnswerState;
  isReview?: boolean;
  compact?: boolean;
  onAnswer(state: SeqAnswerState, score: number, maxScore: number, pass: boolean): void;
}

const BRICK = 'var(--sp-brick,#a85236)';
const GREEN = '#82a668';
const RED = '#d32f2f';

function derange<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = 0; i < a.length - 1; i++) {
    const j = Math.floor(Math.random() * (a.length - i - 1)) + i + 1;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* move item at `from` to index `to` (insert + shift), returns new array.
   This is the jQuery-UI `.sortable()` behaviour the old player used: the
   dragged item is pulled out and re-inserted; everything between shifts to
   fill the gap (NOT a two-item swap). */
function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (from < 0 || from >= arr.length || to < 0 || to >= arr.length || from === to) return arr;
  const next = [...arr];
  const [m] = next.splice(from, 1);
  next.splice(to, 0, m);
  return next;
}

/* ─── Drag logic — unified pointer drag (mouse + touch, no long-press) ───
   Payload is the item's STABLE id (not its index), so as live reordering
   shuffles the array the dragged DOM node stays mounted and keeps following
   the pointer. The target slot is computed from item geometry (midpoint
   crossing) — deterministic, no elementFromPoint flicker — and `onOver` does
   the live insert-shift the instant the pointer crosses into a new slot. */
function useDrag(
  items: SeqOption[],
  isReview: boolean,
  getId: (it: SeqOption) => string,
  orientation: 'vertical' | 'horizontal',
  containerRef: React.RefObject<HTMLDivElement | null>,
  onChange: (next: SeqOption[]) => void,
) {
  const resolveTarget = (x: number, y: number): string | null => {
    const root = containerRef.current;
    if (!root) return null;
    const nodes = Array.from(root.querySelectorAll('[data-drop-id]')) as HTMLElement[];
    if (!nodes.length) return null;
    let target = Number(nodes[nodes.length - 1].getAttribute('data-drop-id'));
    for (const node of nodes) {
      const r = node.getBoundingClientRect();
      const mid = orientation === 'vertical' ? r.top + r.height / 2 : r.left + r.width / 2;
      const p = orientation === 'vertical' ? y : x;
      if (p < mid) { target = Number(node.getAttribute('data-drop-id')); break; }
    }
    return Number.isNaN(target) ? null : String(target);
  };

  const drag = usePointerDrag<string>({
    resolveTarget,
    onOver: (id, targetId) => {
      if (isReview) return;
      const to = Number(targetId);
      const from = items.findIndex(it => getId(it) === id);
      if (Number.isNaN(to) || from < 0 || to === from) return;
      onChange(moveItem(items, from, to));
    },
    onDrop: () => { /* already reordered live during onOver */ },
  });

  const handlers = (idx: number, id: string) => {
    const isDragging = drag.activeKey === id;
    const isOver = drag.overId === String(idx) && !isDragging;
    return {
      'data-drop-id': String(idx),
      ...(isReview ? {} : drag.sourceProps(id, id)),
      style: {
        touchAction: isReview ? undefined : 'none',
        userSelect: isReview ? undefined : 'none',
        WebkitUserSelect: isReview ? undefined : 'none',
        opacity: isDragging ? 0.4 : 1,
        outline: isOver ? `2px solid ${BRICK}` : 'none',
        transition: isDragging ? 'none' : 'transform 0.18s ease',
      } as React.CSSProperties,
    };
  };

  return { handlers, consumeClick: drag.consumeClick };
}

const DragHandle = () => (
  <svg width={16} height={16} viewBox="0 0 14 14" fill="none" style={{ opacity: 0.4, flexShrink: 0, cursor: 'grab' }}>
    {[3, 7, 11].map(cy => (
      <React.Fragment key={cy}>
        <circle cx="4" cy={cy} r="1.3" fill={COLORS.charcoal} />
        <circle cx="10" cy={cy} r="1.3" fill={COLORS.charcoal} />
      </React.Fragment>
    ))}
  </svg>
);

/* small circular move button */
const MoveBtn: React.FC<{ dir: 'up' | 'down' | 'left' | 'right'; disabled: boolean; compact?: boolean; onClick(): void }> = ({ dir, disabled, compact = false, onClick }) => {
  const pts = dir === 'up' ? '18 15 12 9 6 15'
    : dir === 'down' ? '6 9 12 15 18 9'
    : dir === 'left' ? '15 18 9 12 15 6'
    : '9 18 15 12 9 6';
  return (
    <button
      onPointerDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onClick(); }}
      disabled={disabled} aria-label={`move ${dir}`}
      style={{
        width: compact ? 26 : 30, height: compact ? 26 : 30, borderRadius: 8, flexShrink: 0,
        border: `1.5px solid ${COLORS.gray100}`, background: disabled ? COLORS.gray50 : COLORS.white,
        color: disabled ? COLORS.gray100 : COLORS.charcoal, cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'all 0.12s',
      }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points={pts} /></svg>
    </button>
  );
};

const ResultIcon: React.FC<{ correct: boolean }> = ({ correct }) => correct
  ? <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><polyline points="20,6 9,17 4,12" /></svg>
  : <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;

function stateColors(isCorrect: boolean, isWrong: boolean) {
  return {
    border: `1.5px solid ${isCorrect ? GREEN : isWrong ? RED : COLORS.gray100}`,
    bg: isCorrect ? '#f0f7ed' : isWrong ? '#fdf2f2' : COLORS.white,
    badge: isCorrect ? GREEN : isWrong ? RED : BRICK,
  };
}

/* ─── Vertical — list, drag handle + up/down buttons (screenshot A) ─── */
const VerticalItems: React.FC<{
  items: SeqOption[]; isReview: boolean; compact: boolean; getId(it: SeqOption): string; onChange(next: SeqOption[]): void;
}> = ({ items, isReview, compact, getId, onChange }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const { handlers, consumeClick } = useDrag(items, isReview, getId, 'vertical', containerRef, onChange);
  const [touchSelected, setTouchSelected] = React.useState<number | null>(null);

  const handleTap = (idx: number) => {
    if (isReview || consumeClick()) return;
    if (touchSelected === null) {
      setTouchSelected(idx);
    } else if (touchSelected === idx) {
      setTouchSelected(null);
    } else {
      onChange(moveItem(items, touchSelected, idx));
      setTouchSelected(null);
    }
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'safe center', gap: compact ? 8 : 16 }}>
      {items.map((item, idx) => {
        const origOrder = (item.sequenceOrder ?? idx + 1) - 1;
        const isCorrect = isReview && origOrder === idx;
        const isWrong = isReview && origOrder !== idx;
        const c = stateColors(isCorrect, isWrong);
        const { style: dragStyle, ...evts } = handlers(idx, getId(item));
        const isTouchSel = touchSelected === idx;
        return (
          <div key={getId(item)} {...evts}
            onClick={() => handleTap(idx)} className={isReview ? undefined : "eq-opt"}
            style={{ border: isTouchSel ? `2px solid ${BRICK}` : c.border, background: isTouchSel ? '#fdf5f3' : c.bg, borderRadius: 16, padding: 'clamp(10px, 1.6cqi, 22px) clamp(14px, 2.4cqi, 32px)', display: 'flex', alignItems: 'center', gap: compact ? 10 : 20, cursor: isReview ? 'default' : 'grab', transition: 'all 0.15s', boxShadow: isTouchSel ? `0 0 0 3px rgba(168,82,54,0.15)` : '0 2px 6px rgba(0,0,0,0.06)', flexShrink: 0, minHeight: 'clamp(50px, 6cqi, 84px)', ...dragStyle }}>
            <div style={{ width: 'clamp(28px, 3.4cqi, 46px)', height: 'clamp(28px, 3.4cqi, 46px)', borderRadius: '50%', background: c.badge, color: COLORS.white, fontWeight: 700, fontSize: 'clamp(13px, 1.5cqi, 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</div>
            {!isReview && <DragHandle />}
            {item.image && <img src={item.image} alt="" style={{ maxHeight: 'clamp(36px, 4.5cqi, 64px)', borderRadius: 6 }} />}
            <span style={{ flex: 1, fontSize: 'clamp(14px, 1.7cqi, 22px)', fontWeight: 600, color: COLORS.obsidian, lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: item.text ?? '' }} />
            {isReview && <ResultIcon correct={isCorrect} />}
          </div>
        );
      })}
    </div>
  );
};

/* ─── Horizontal — cards with brick position header + left/right buttons (screenshot B) ─── */
const HorizontalItems: React.FC<{
  items: SeqOption[]; isReview: boolean; compact: boolean; getId(it: SeqOption): string; onChange(next: SeqOption[]): void;
}> = ({ items, isReview, compact, getId, onChange }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const { handlers, consumeClick } = useDrag(items, isReview, getId, 'horizontal', containerRef, onChange);
  const [touchSelected, setTouchSelected] = React.useState<number | null>(null);

  const handleTap = (idx: number) => {
    if (isReview || consumeClick()) return;
    if (touchSelected === null) {
      setTouchSelected(idx);
    } else if (touchSelected === idx) {
      setTouchSelected(null);
    } else {
      onChange(moveItem(items, touchSelected, idx));
      setTouchSelected(null);
    }
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', alignContent: 'safe center', justifyContent: 'center', gap: compact ? 8 : 16 }}>
      {items.map((item, idx) => {
        const origOrder = (item.sequenceOrder ?? idx + 1) - 1;
        const isCorrect = isReview && origOrder === idx;
        const isWrong = isReview && origOrder !== idx;
        const c = stateColors(isCorrect, isWrong);
        const { style: dragStyle, ...evts } = handlers(idx, getId(item));
        const isTouchSel = touchSelected === idx;
        return (
          <div key={getId(item)} {...evts}
            onClick={() => handleTap(idx)} className={isReview ? undefined : "eq-opt"}
            style={{ flex: compact ? '1 1 100px' : '1 1 180px', minWidth: compact ? 88 : 150, maxWidth: compact ? 200 : 300, minHeight: 'clamp(110px, 17cqi, 220px)', maxHeight: '100%', border: isTouchSel ? `2px solid ${BRICK}` : c.border, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: isTouchSel ? '#fdf5f3' : c.bg, cursor: isReview ? 'default' : 'grab', transition: 'all 0.15s', boxShadow: isTouchSel ? `0 0 0 3px rgba(168,82,54,0.15)` : '0 2px 8px rgba(0,0,0,0.06)', ...dragStyle }}>
            {/* position header */}
            <div style={{ background: c.badge, color: COLORS.white, fontWeight: 700, fontSize: 'clamp(15px, 1.6cqi, 20px)', textAlign: 'center', padding: 'clamp(6px, 1cqi, 12px) 0', flexShrink: 0 }}>{idx + 1}</div>
            {/* body */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: compact ? 8 : 14, padding: 'clamp(14px, 2.4cqi, 28px) clamp(10px, 1.7cqi, 20px)', overflowY: 'auto', touchAction: isReview ? undefined : 'none' }}>
              {item.image && <img src={item.image} alt="" style={{ maxWidth: '100%', maxHeight: 'clamp(48px, 7cqi, 96px)', borderRadius: 6, objectFit: 'contain' }} />}
              <span style={{ fontSize: 'clamp(13px, 1.5cqi, 18px)', fontWeight: 600, color: COLORS.obsidian, textAlign: 'center', lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: item.text ?? '' }} />
              {isReview && <ResultIcon correct={isCorrect} />}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ─── SequenceQuestion ─── */
const SequenceQuestion: React.FC<Props> = ({ data, config, reviewState, isReview = false, compact = false, onAnswer }) => {
  const maxScore = config.max_score ?? data.options.length;
  const layout = (config.layout ?? 'Vertical').toLowerCase();

  const [items, setItems] = React.useState<SeqOption[]>(() => {
    if (reviewState) return reviewState.currentOrder.map(i => reviewState.options[i]);
    return derange([...data.options]);
  });

  React.useEffect(() => {
    if (reviewState) setItems(reviewState.currentOrder.map(i => reviewState.options[i]));
  }, [reviewState]);

  const evaluate = (next: SeqOption[]) => {
    let correctCount = 0;
    next.forEach((item, pos) => {
      const origOrder = (item.sequenceOrder ?? pos + 1) - 1;
      if (origOrder === pos) correctCount++;
    });
    const pass = correctCount === data.options.length;
    const score = config.partial_scoring
      ? parseFloat(((correctCount / data.options.length) * maxScore).toFixed(2))
      : pass ? maxScore : 0;
    const origOptions = [...data.options].sort((a, b) => (a.sequenceOrder ?? 0) - (b.sequenceOrder ?? 0));
    const currentOrder = next.map(item => origOptions.findIndex(o => o === item));
    onAnswer({ type: 'sequence', currentOrder, options: origOptions }, score, maxScore, pass);
  };

  const handleChange = (next: SeqOption[]) => {
    if (isReview || next === items) return;
    setItems(next);
    evaluate(next);
  };

  const isHorizontal = layout === 'vertical';

  // Stable id per option object (objects are reused across reorders), so React
  // keys track the item — not its position — keeping the dragged node alive
  // (and its pointer capture) while live swaps shuffle the array.
  const idMap = React.useRef(new WeakMap<SeqOption, string>());
  const idCounter = React.useRef(0);
  const getId = React.useCallback((it: SeqOption) => {
    let id = idMap.current.get(it);
    if (!id) { id = 's' + idCounter.current++; idMap.current.set(it, id); }
    return id;
  }, []);

  return (
    <div style={{ fontFamily: FONT_FAMILY, width: '100%', display: 'flex', flexDirection: 'column', gap: compact ? 8 : 12 }}>
      {isHorizontal
        ? <HorizontalItems items={items} isReview={isReview} compact={compact} getId={getId} onChange={handleChange} />
        : <VerticalItems items={items} isReview={isReview} compact={compact} getId={getId} onChange={handleChange} />
      }
    </div>
  );
};

export default SequenceQuestion;
