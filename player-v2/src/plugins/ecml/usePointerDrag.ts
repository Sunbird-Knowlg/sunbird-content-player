import React from 'react';

/**
 * Unified pointer-based drag for mouse AND touch.
 *
 * HTML5 `draggable` needs a janky long-press on touch and fights page scroll.
 * Pointer Events start instantly on press-and-move and work identically on
 * mouse, pen, and touch.
 *
 * While a drag is active the move/up listeners live on `window` (NOT on the
 * source element, and we do NOT use setPointerCapture). Capturing the pointer
 * to the source breaks live reordering: when the dragged element is moved in
 * the DOM the captured node and the layout fight each other. Window listeners
 * keep firing no matter how the list shuffles underneath.
 *
 * Drop targets mark themselves with `data-drop-id`. By default the target under
 * the pointer is found via `elementFromPoint` (good for fixed slots, e.g. MTF).
 * For reorderable lists pass `resolveTarget(x,y)` to compute the target index
 * from item geometry (midpoint crossing) — deterministic, no flicker.
 */
export function usePointerDrag<T>(opts: {
  onDrop: (payload: T, targetId: string | null) => void;
  /** Fires while dragging whenever the resolved target changes (non-null).
   *  Use for live reorder previews before the drop. */
  onOver?: (payload: T, targetId: string) => void;
  /** Custom target resolver from viewport coords; overrides elementFromPoint. */
  resolveTarget?: (x: number, y: number) => string | null;
  targetAttr?: string;
  /** Snap to the nearest `[attr]` when released over a gap (no direct hit). */
  nearestFallback?: boolean;
}) {
  const attr = opts.targetAttr ?? 'data-drop-id';
  const [activeKey, setActiveKey] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  const payloadRef = React.useRef<T | null>(null);
  const overRef = React.useRef<string | null>(null);
  const movedRef = React.useRef(false);
  const justDraggedRef = React.useRef(false);

  // Latest opts (move/up handlers are stable, so they read through this ref).
  const optsRef = React.useRef(opts);
  optsRef.current = opts;

  /* ── Floating drag ghost: a clone of the source that follows the pointer ── */
  const srcRef = React.useRef<HTMLElement | null>(null);
  const ghostRef = React.useRef<HTMLElement | null>(null);   // wrapper (removed on kill)
  const cloneRef = React.useRef<HTMLElement | null>(null);   // the visible clone (translated)
  const offsetRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const makeGhost = (src: HTMLElement, x: number, y: number) => {
    const rect = src.getBoundingClientRect();
    offsetRef.current = { x: x - rect.left, y: y - rect.top };

    // The clone is appended to <body>, OUTSIDE the embed's `.eq-scale` query
    // container, so any `cqi`-based sizing inside it would re-resolve against the
    // page (jumping to clamp maxes → too big). Wrap the clone in a fixed element
    // that carries the SAME width as the embed container, with its own
    // `container-type`, so `cqi` resolves to the embed width and the ghost
    // matches the on-screen option exactly.
    const eq = src.closest('.eq-scale') as HTMLElement | null;
    const cqWidth = eq ? eq.getBoundingClientRect().width : window.innerWidth;
    const wrapper = document.createElement('div');
    wrapper.style.cssText = `position:fixed;left:0;top:0;width:${cqWidth}px;height:0;margin:0;padding:0;border:0;pointer-events:none;z-index:999999;`;
    wrapper.style.containerType = 'inline-size';

    const clone = src.cloneNode(true) as HTMLElement;
    const s = clone.style;
    s.position = 'absolute';
    s.left = '0';
    s.top = '0';
    s.margin = '0';
    s.boxSizing = 'border-box';
    s.width = `${rect.width}px`;
    s.height = `${rect.height}px`;
    s.opacity = '0.95';
    s.cursor = 'grabbing';
    s.transformOrigin = 'top left';
    s.transition = 'none';
    s.boxShadow = '0 16px 34px rgba(0,0,0,0.28)';
    // Straight, original size (no scale/rotate); positioned via viewport coords.
    s.transform = `translate(${rect.left}px, ${rect.top}px)`;

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    ghostRef.current = wrapper;
    cloneRef.current = clone;
  };

  const moveGhost = (x: number, y: number) => {
    const c = cloneRef.current;
    if (!c) return;
    c.style.transform = `translate(${x - offsetRef.current.x}px, ${y - offsetRef.current.y}px)`;
  };

  const killGhost = () => {
    ghostRef.current?.remove();
    ghostRef.current = null;
    cloneRef.current = null;
    srcRef.current = null;
  };

  /** Distance from point (x,y) to the nearest edge of a rect (0 if inside). */
  const distToRect = (r: DOMRect, x: number, y: number): number => {
    const dx = Math.max(r.left - x, 0, x - r.right);
    const dy = Math.max(r.top - y, 0, y - r.bottom);
    return Math.sqrt(dx * dx + dy * dy);
  };

  const nearestTarget = (x: number, y: number): string | null => {
    const nodes = document.querySelectorAll(`[${attr}]`);
    let best: string | null = null;
    let bestDist = Infinity;
    nodes.forEach(node => {
      const r = (node as Element).getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      const d = distToRect(r, x, y);
      if (d < bestDist) { bestDist = d; best = (node as Element).getAttribute(attr); }
    });
    return best;
  };

  const findTarget = (x: number, y: number): string | null => {
    if (optsRef.current.resolveTarget) return optsRef.current.resolveTarget(x, y);
    const el = document.elementFromPoint(x, y);
    const tgt = el?.closest(`[${attr}]`);
    const direct = tgt?.getAttribute(attr) ?? null;
    if (direct !== null) return direct;
    return optsRef.current.nearestFallback ? nearestTarget(x, y) : null;
  };

  // Stable window handlers — bound once, read live state through refs/optsRef.
  const onWinMove = React.useRef((e: PointerEvent) => {
    if (payloadRef.current === null) return;
    if (!movedRef.current && srcRef.current) makeGhost(srcRef.current, e.clientX, e.clientY);
    movedRef.current = true;
    moveGhost(e.clientX, e.clientY);
    const id = findTarget(e.clientX, e.clientY);
    if (id !== overRef.current) {
      overRef.current = id;
      setOverId(id);
      if (id !== null) optsRef.current.onOver?.(payloadRef.current, id);
    }
  });

  const endDrag = React.useRef((commit: boolean, e?: PointerEvent) => {
    const payload = payloadRef.current;
    if (commit && payload !== null && movedRef.current) {
      const target = overRef.current ?? (e ? findTarget(e.clientX, e.clientY) : null);
      optsRef.current.onDrop(payload, target);
      justDraggedRef.current = true; // swallow the click that follows
    }
    killGhost();
    document.body.style.userSelect = '';
    (document.body.style as CSSStyleDeclaration & { webkitUserSelect?: string }).webkitUserSelect = '';
    payloadRef.current = null;
    overRef.current = null;
    movedRef.current = false;
    setActiveKey(null);
    setOverId(null);
    window.removeEventListener('pointermove', onWinMove.current);
    window.removeEventListener('pointerup', onWinUp.current);
    window.removeEventListener('pointercancel', onWinCancel.current);
  });

  const onWinUp = React.useRef((e: PointerEvent) => endDrag.current(true, e));
  const onWinCancel = React.useRef(() => endDrag.current(false));

  React.useEffect(() => () => { endDrag.current(false); }, []);

  const sourceProps = (payload: T, key: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      payloadRef.current = payload;
      movedRef.current = false;
      srcRef.current = e.currentTarget as HTMLElement;
      setActiveKey(key);
      // Suppress text selection (highlight) while dragging — both the gesture
      // start and any text under the pointer as the list shuffles.
      e.preventDefault();
      document.body.style.userSelect = 'none';
      (document.body.style as CSSStyleDeclaration & { webkitUserSelect?: string }).webkitUserSelect = 'none';
      window.addEventListener('pointermove', onWinMove.current);
      window.addEventListener('pointerup', onWinUp.current);
      window.addEventListener('pointercancel', onWinCancel.current);
    },
  });

  /** Call at the top of an onClick handler; returns true if a drag just finished. */
  const consumeClick = (): boolean => {
    if (justDraggedRef.current) { justDraggedRef.current = false; return true; }
    return false;
  };

  return {
    /** key of the source currently being dragged (null if none) */
    activeKey,
    /** target id currently under the pointer (null if none) */
    overId,
    sourceProps,
    consumeClick,
  };
}
