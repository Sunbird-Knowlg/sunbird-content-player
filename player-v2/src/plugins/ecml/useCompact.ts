import React from 'react';

/**
 * Breakpoint hook for ECML question components.
 *
 * Returns [refCallback, compact, short, width]. Attach `refCallback` to the root.
 *
 * Thresholds are anchored to real mobile viewport sizes (CSS px):
 *   - Phone PORTRAIT: width 360–430 (iPhone SE 375 … 14 Pro Max 430; Android 360–412).
 *   - Phone LANDSCAPE: height 360–430 (same devices on their side), width 640–932.
 *   - Tablet: 768–1024 (treated as desktop — card layout fits fine).
 *   - Desktop collection/course embed: width ~700–1250, height ~480–700.
 *
 * `compact` (WIDTH < wThreshold=640) — portrait phones + narrow windows. Drives
 *   the mobile layout (question merges into the header, tighter spacing).
 *
 * `short` (HEIGHT < hThreshold=500) — landscape phones (≤430px tall) but NOT a
 *   desktop collection embed (≥~480px tall). Also drives the mobile layout so a
 *   landscape phone behaves like a phone, while the collection keeps the card.
 *
 * `width` — raw container width, for structural decisions (e.g. split stacking).
 *
 * `coarse` — true on a REAL touch device (phone/tablet: `(pointer: coarse)` +
 *   `(hover: none)`), false on desktop (mouse). This is the only reliable way to
 *   tell a landscape phone apart from a short desktop collection embed — their
 *   sizes overlap, but only the phone has a coarse pointer. Use it to gate the
 *   mobile-only layout so a desktop collection NEVER gets the phone treatment.
 */
export function useCompact<T extends HTMLElement = HTMLDivElement>(
  wThreshold = 640,
  hThreshold = 500,
): [(el: T | null) => void, boolean, boolean, number, boolean] {
  const [element, setElement] = React.useState<T | null>(null);
  const [compact, setCompact] = React.useState(false);
  const [short, setShort] = React.useState(false);
  const [width, setWidth] = React.useState(9999);
  const [coarse, setCoarse] = React.useState(false);

  React.useEffect(() => {
    if (!element || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setCompact(width < wThreshold);
      setShort(height < hThreshold);
      setWidth(width);
    });
    ro.observe(element);
    return () => ro.disconnect();
  }, [element, wThreshold, hThreshold]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    // Touch device = coarse pointer AND can't hover. Desktops (incl. the course
    // collection embed) are fine-pointer + hover → coarse stays false.
    const mq = window.matchMedia('(pointer: coarse) and (hover: none)');
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  return [setElement, compact, short, width, coarse];
}
