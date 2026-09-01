import React from 'react';
import {
  useDraggable,
  useDroppable,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Shared dnd-kit wiring for the ECML question types (MTF, Sequence).
 *
 * Why dnd-kit over the old custom `usePointerDrag`:
 *  - keyboard drag + screen-reader announcements for free (a11y),
 *  - battle-tested touch via PointerSensor,
 *  - the activation `distance` constraint means a tap never starts a drag,
 *    so the tap-to-place fallback keeps working through plain onClick.
 */

/** Pointer (mouse + touch) with a 5px activation threshold so taps stay clicks,
 *  plus keyboard drag for accessibility. */
export function useDndSensors() {
  return useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );
}

/**
 * Width of the nearest `.eq-scale` ancestor, tracked on resize.
 *
 * dnd-kit's `<DragOverlay>` portals its content to `<body>`, OUTSIDE the embed's
 * `.eq-scale` container. Any `cqi`-based sizing inside the overlay would then
 * re-resolve against the page width (jumping to the clamp maxes → giant ghost).
 * Wrapping the overlay in a fixed element that carries this width AND its own
 * `container-type` makes `cqi` resolve to the embed width again, so the ghost
 * matches the on-screen option exactly.
 */
export function useEqScaleWidth(ref: React.RefObject<HTMLElement | null>): number | null {
  const [w, setW] = React.useState<number | null>(null);
  React.useEffect(() => {
    const eq = ref.current?.closest('.eq-scale') as HTMLElement | null;
    if (!eq) return;
    const update = () => setW(eq.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(eq);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** Wraps DragOverlay content so `cqi` units inside it resolve to the embed width. */
export const EqOverlayScope: React.FC<{ width: number | null; children: React.ReactNode }> = ({ width, children }) =>
  width == null
    ? <>{children}</>
    : <div style={{ width, containerType: 'inline-size' }}>{children}</div>;

/** Render-prop draggable — keeps the existing option JSX intact. */
export const Draggable: React.FC<{
  id: string;
  disabled?: boolean;
  children: (p: {
    setNodeRef: (el: HTMLElement | null) => void;
    listeners: Record<string, unknown> | undefined;
    attributes: Record<string, unknown>;
    isDragging: boolean;
  }) => React.ReactNode;
}> = ({ id, disabled, children }) => {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({ id, disabled });
  return <>{children({ setNodeRef, listeners, attributes: attributes as unknown as Record<string, unknown>, isDragging })}</>;
};

/** Render-prop droppable — keeps the existing slot/pool JSX intact. */
export const Droppable: React.FC<{
  id: string;
  disabled?: boolean;
  children: (p: { setNodeRef: (el: HTMLElement | null) => void; isOver: boolean }) => React.ReactNode;
}> = ({ id, disabled, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });
  return <>{children({ setNodeRef, isOver })}</>;
};

/** Render-prop sortable item — for reorderable lists (Sequence). Provides the
 *  live shift transform/transition dnd-kit computes while dragging. */
export const Sortable: React.FC<{
  id: string;
  disabled?: boolean;
  children: (p: {
    setNodeRef: (el: HTMLElement | null) => void;
    listeners: Record<string, unknown> | undefined;
    attributes: Record<string, unknown>;
    style: React.CSSProperties;
    isDragging: boolean;
  }) => React.ReactNode;
}> = ({ id, disabled, children }) => {
  const { setNodeRef, listeners, attributes, transform, transition, isDragging } = useSortable({ id, disabled });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  return <>{children({
    setNodeRef,
    listeners,
    attributes: attributes as unknown as Record<string, unknown>,
    style,
    isDragging,
  })}</>;
};
