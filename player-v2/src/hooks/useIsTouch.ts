import React from 'react';

/**
 * Returns true on coarse-pointer / hover-less devices (phones, most tablets).
 *
 * Used to opt INTO touch-friendly behaviour without changing desktop/web UX:
 * every touch-specific branch in the plugins is gated on this, so on a mouse
 * device the value is `false` and the original web behaviour is preserved.
 *
 * SSR-safe: defaults to `false` until mounted.
 */
export function useIsTouch(): boolean {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    const update = () => setIsTouch(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener('change', update);
    else mq.addListener(update); // Safari < 14
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', update);
      else mq.removeListener(update);
    };
  }, []);

  return isTouch;
}

export default useIsTouch;
