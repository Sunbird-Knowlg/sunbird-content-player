import React from 'react';
import type { SeqData, SeqConfig, SeqAnswerState, SeqOption } from '../ecml.types';
import { COLORS, FONT_FAMILY } from '../../../constants';
import { DndContext, DragOverlay, closestCenter, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Sortable, useDndSensors, useEqScaleWidth, EqOverlayScope } from '../dndShared';

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

/* move item at `from` to index `to` (insert + shift), returns new array — the
   jQuery-UI `.sortable()` behaviour the old player used (NOT a two-item swap).
   Used for tap-to-place; drag-drop uses dnd-kit's arrayMove (same semantics). */
function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (from < 0 || from >= arr.length || to < 0 || to >= arr.length || from === to) return arr;
  const next = [...arr];
  const [m] = next.splice(from, 1);
  next.splice(to, 0, m);
  return next;
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

/* Shared drag/tap plumbing for both layouts. dnd-kit handles the drag (live
   shift via transforms, commit on drop with arrayMove); tap-to-place stays a
   plain click path (the 5px activation distance keeps taps from starting a
   drag), guarded so a finished drag doesn't also fire a tap. */
function useSeqDnd(
  items: SeqOption[],
  getId: (it: SeqOption) => string,
  onChange: (next: SeqOption[]) => void,
) {
  const sensors = useDndSensors();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const justDraggedRef = React.useRef(false);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    justDraggedRef.current = true;
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = items.findIndex(it => getId(it) === active.id);
    const to = items.findIndex(it => getId(it) === over.id);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(items, from, to));
  };
  const onDragCancel = () => { setActiveId(null); justDraggedRef.current = true; };

  return { sensors, activeId, justDraggedRef, onDragStart, onDragEnd, onDragCancel };
}

/* ─── Vertical — list, drag handle (screenshot A) ─── */
const VerticalItems: React.FC<{
  items: SeqOption[]; isReview: boolean; compact: boolean; getId(it: SeqOption): string; onChange(next: SeqOption[]): void;
}> = ({ items, isReview, compact, getId, onChange }) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const eqWidth = useEqScaleWidth(rootRef);
  const { sensors, activeId, justDraggedRef, onDragStart, onDragEnd, onDragCancel } = useSeqDnd(items, getId, onChange);
  const [touchSelected, setTouchSelected] = React.useState<number | null>(null);

  const handleTap = (idx: number) => {
    if (isReview) return;
    if (justDraggedRef.current) { justDraggedRef.current = false; return; }
    if (touchSelected === null) {
      setTouchSelected(idx);
    } else if (touchSelected === idx) {
      setTouchSelected(null);
    } else {
      onChange(moveItem(items, touchSelected, idx));
      setTouchSelected(null);
    }
  };

  const rowVisual = (item: SeqOption, idx: number, dragging: boolean, isTouchSel: boolean) => {
    const origOrder = (item.sequenceOrder ?? idx + 1) - 1;
    const isCorrect = isReview && origOrder === idx;
    const isWrong = isReview && origOrder !== idx;
    const c = stateColors(isCorrect, isWrong);
    return {
      c, isCorrect,
      style: {
        border: isTouchSel ? `2px solid ${BRICK}` : c.border, background: isTouchSel ? '#fdf5f3' : c.bg,
        borderRadius: 16, padding: 'clamp(10px, 1.6cqi, 22px) clamp(14px, 2.4cqi, 32px)',
        display: 'flex', alignItems: 'center', gap: compact ? 10 : 20, cursor: isReview ? 'default' : 'grab',
        transition: 'all 0.15s', boxShadow: isTouchSel ? `0 0 0 3px rgba(168,82,54,0.15)` : '0 2px 6px rgba(0,0,0,0.06)',
        flexShrink: 0, minHeight: 'clamp(50px, 6cqi, 84px)', opacity: dragging ? 0.4 : 1,
      } as React.CSSProperties,
    };
  };

  const rowBody = (item: SeqOption, idx: number, isCorrect: boolean, badge: string) => (
    <>
      <div style={{ width: 'clamp(28px, 3.4cqi, 46px)', height: 'clamp(28px, 3.4cqi, 46px)', borderRadius: '50%', background: badge, color: COLORS.white, fontWeight: 700, fontSize: 'clamp(13px, 1.5cqi, 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{idx + 1}</div>
      {!isReview && <DragHandle />}
      {item.image && <img src={item.image} alt="" style={{ maxHeight: 'clamp(36px, 4.5cqi, 64px)', borderRadius: 6 }} />}
      <span style={{ flex: 1, fontSize: 'clamp(14px, 1.7cqi, 22px)', fontWeight: 600, color: COLORS.obsidian, lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: item.text ?? '' }} />
      {isReview && <ResultIcon correct={isCorrect} />}
    </>
  );

  const activeItem = activeId != null ? items.find(it => getId(it) === activeId) : undefined;
  const activeIdx = activeItem ? items.indexOf(activeItem) : -1;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
      <SortableContext items={items.map(getId)} strategy={verticalListSortingStrategy}>
        <div ref={rootRef} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'safe center', gap: compact ? 8 : 16 }}>
          {items.map((item, idx) => {
            const isTouchSel = touchSelected === idx;
            return (
              <Sortable key={getId(item)} id={getId(item)} disabled={isReview}>
                {({ setNodeRef, listeners, attributes, style: sortStyle, isDragging }) => {
                  const v = rowVisual(item, idx, isDragging, isTouchSel);
                  return (
                    <div
                      ref={setNodeRef}
                      {...(isReview ? {} : listeners)}
                      {...(isReview ? {} : attributes)}
                      onClick={() => handleTap(idx)}
                      className={isReview ? undefined : 'eq-opt'}
                      style={{ ...v.style, ...sortStyle, touchAction: isReview ? undefined : 'none', userSelect: 'none' }}
                    >
                      {rowBody(item, idx, v.isCorrect, v.c.badge)}
                    </div>
                  );
                }}
              </Sortable>
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <EqOverlayScope width={eqWidth}>
            {(() => {
              const v = rowVisual(activeItem, activeIdx, false, false);
              return <div style={{ ...v.style, cursor: 'grabbing', boxShadow: '0 16px 34px rgba(0,0,0,0.28)', userSelect: 'none' }}>{rowBody(activeItem, activeIdx, v.isCorrect, v.c.badge)}</div>;
            })()}
          </EqOverlayScope>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

/* ─── Horizontal — wrapping cards with brick position header (screenshot B) ─── */
const HorizontalItems: React.FC<{
  items: SeqOption[]; isReview: boolean; compact: boolean; getId(it: SeqOption): string; onChange(next: SeqOption[]): void;
}> = ({ items, isReview, compact, getId, onChange }) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const eqWidth = useEqScaleWidth(rootRef);
  const { sensors, activeId, justDraggedRef, onDragStart, onDragEnd, onDragCancel } = useSeqDnd(items, getId, onChange);
  const [touchSelected, setTouchSelected] = React.useState<number | null>(null);

  const handleTap = (idx: number) => {
    if (isReview) return;
    if (justDraggedRef.current) { justDraggedRef.current = false; return; }
    if (touchSelected === null) {
      setTouchSelected(idx);
    } else if (touchSelected === idx) {
      setTouchSelected(null);
    } else {
      onChange(moveItem(items, touchSelected, idx));
      setTouchSelected(null);
    }
  };

  const cardVisual = (item: SeqOption, idx: number, dragging: boolean, isTouchSel: boolean) => {
    const origOrder = (item.sequenceOrder ?? idx + 1) - 1;
    const isCorrect = isReview && origOrder === idx;
    const isWrong = isReview && origOrder !== idx;
    const c = stateColors(isCorrect, isWrong);
    return {
      c, isCorrect,
      style: {
        flex: compact ? '1 1 100px' : '1 1 180px', minWidth: compact ? 88 : 150, maxWidth: compact ? 200 : 300,
        minHeight: 'clamp(110px, 17cqi, 220px)', maxHeight: '100%',
        border: isTouchSel ? `2px solid ${BRICK}` : c.border, borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', background: isTouchSel ? '#fdf5f3' : c.bg,
        cursor: isReview ? 'default' : 'grab', transition: 'all 0.15s',
        boxShadow: isTouchSel ? `0 0 0 3px rgba(168,82,54,0.15)` : '0 2px 8px rgba(0,0,0,0.06)',
        opacity: dragging ? 0.4 : 1,
      } as React.CSSProperties,
    };
  };

  const cardBody = (item: SeqOption, idx: number, isCorrect: boolean, badge: string) => (
    <>
      <div style={{ background: badge, color: COLORS.white, fontWeight: 700, fontSize: 'clamp(15px, 1.6cqi, 20px)', textAlign: 'center', padding: 'clamp(6px, 1cqi, 12px) 0', flexShrink: 0 }}>{idx + 1}</div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: compact ? 8 : 14, padding: 'clamp(14px, 2.4cqi, 28px) clamp(10px, 1.7cqi, 20px)', overflowY: 'auto', touchAction: isReview ? undefined : 'none' }}>
        {item.image && <img src={item.image} alt="" style={{ maxWidth: '100%', maxHeight: 'clamp(48px, 7cqi, 96px)', borderRadius: 6, objectFit: 'contain' }} />}
        <span style={{ fontSize: 'clamp(13px, 1.5cqi, 18px)', fontWeight: 600, color: COLORS.obsidian, textAlign: 'center', lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: item.text ?? '' }} />
        {isReview && <ResultIcon correct={isCorrect} />}
      </div>
    </>
  );

  const activeItem = activeId != null ? items.find(it => getId(it) === activeId) : undefined;
  const activeIdx = activeItem ? items.indexOf(activeItem) : -1;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={onDragCancel}>
      <SortableContext items={items.map(getId)} strategy={rectSortingStrategy}>
        <div ref={rootRef} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', alignContent: 'safe center', justifyContent: 'center', gap: compact ? 8 : 16 }}>
          {items.map((item, idx) => {
            const isTouchSel = touchSelected === idx;
            return (
              <Sortable key={getId(item)} id={getId(item)} disabled={isReview}>
                {({ setNodeRef, listeners, attributes, style: sortStyle, isDragging }) => {
                  const v = cardVisual(item, idx, isDragging, isTouchSel);
                  return (
                    <div
                      ref={setNodeRef}
                      {...(isReview ? {} : listeners)}
                      {...(isReview ? {} : attributes)}
                      onClick={() => handleTap(idx)}
                      className={isReview ? undefined : 'eq-opt'}
                      style={{ ...v.style, ...sortStyle, userSelect: 'none' }}
                    >
                      {cardBody(item, idx, v.isCorrect, v.c.badge)}
                    </div>
                  );
                }}
              </Sortable>
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <EqOverlayScope width={eqWidth}>
            {(() => {
              const v = cardVisual(activeItem, activeIdx, false, false);
              return <div style={{ ...v.style, cursor: 'grabbing', boxShadow: '0 16px 34px rgba(0,0,0,0.28)', userSelect: 'none' }}>{cardBody(activeItem, activeIdx, v.isCorrect, v.c.badge)}</div>;
            })()}
          </EqOverlayScope>
        ) : null}
      </DragOverlay>
    </DndContext>
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
  // keys + sortable ids track the item — not its position.
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
