/**
 * Renders a single ECML slide stage.
 * All x/y/w/h are percentages (0-100) relative to the stage container.
 */
import React from 'react';
import type { EcmlSlide, EcmlElement, EcmlShapeElement, EcmlImageElement, EcmlTextElement } from './ecml.types';
import { FONT_FAMILY } from '../../constants';

interface EcmlSlideRendererProps {
  slide: EcmlSlide;
}

function elementStyle(el: EcmlElement & { x?: number; y?: number; w?: number; h?: number; rotate?: number; opacity?: number; visible?: boolean | string }): React.CSSProperties {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${el.x ?? 0}%`,
    top: `${el.y ?? 0}%`,
    width: `${el.w ?? 10}%`,
    height: `${el.h ?? 10}%`,
    boxSizing: 'border-box',
  };
  if (el.rotate) style.transform = `rotate(${el.rotate}deg)`;
  if (el.opacity !== undefined && el.opacity !== 1) style.opacity = el.opacity / 100; // ECML opacity is 0-100
  if (el.visible === false || el.visible === 'false') style.display = 'none';
  return style;
}

function ShapeEl({ el }: { el: EcmlShapeElement }) {
  const base = elementStyle(el);
  const fill = el.fill ?? 'transparent';
  const stroke = el.stroke ?? 'none';
  const sw = el['stroke-width'] ?? 0;
  const type = (el.type ?? 'rect').toLowerCase();

  if (type === 'circle' || type === 'ellipse') {
    return (
      <div style={{ ...base, borderRadius: '50%', background: fill, boxSizing: 'border-box', border: stroke !== 'none' && sw ? `${sw}px solid ${stroke}` : undefined }} />
    );
  }
  if (type === 'roundrect') {
    const r = el.r ?? 8;
    return (
      <div style={{ ...base, borderRadius: `${r}%`, background: fill, border: stroke !== 'none' && sw ? `${sw}px solid ${stroke}` : undefined }} />
    );
  }
  // rect / star / trapezium / default — render as div (stars/trapezium approximate)
  return (
    <div style={{ ...base, background: fill, border: stroke !== 'none' && sw ? `${sw}px solid ${stroke}` : undefined }} />
  );
}

function ImageEl({ el }: { el: EcmlImageElement }) {
  if (!el.src) return null;
  return (
    <img
      src={el.src}
      alt=""
      style={{ ...elementStyle(el), objectFit: 'contain' }}
      draggable={false}
    />
  );
}

function TextEl({ el }: { el: EcmlTextElement }) {
  const base = elementStyle(el);
  return (
    <div style={{
      ...base,
      display: 'flex',
      alignItems: 'center',
      justifyContent: el.align === 'right' ? 'flex-end' : el.align === 'center' ? 'center' : 'flex-start',
      overflow: 'hidden',
      fontFamily: el.font ? `${el.font}, ${FONT_FAMILY}` : FONT_FAMILY,
      fontSize: el.fontsize ? `${el.fontsize}%` : '4%',
      color: el.color ?? '#000',
      fontWeight: el.weight === 'bold' ? 700 : undefined,
      textShadow: el.shadow ? `1px 1px 2px ${el.shadow}` : undefined,
      textAlign: el.align as React.CSSProperties['textAlign'] ?? 'left',
      wordBreak: 'break-word',
      lineHeight: 1.2,
    }}>
      {el.text}
    </div>
  );
}

const EcmlSlideRenderer: React.FC<EcmlSlideRendererProps> = ({ slide }) => {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: slide.background ?? '#fff',
      overflow: 'hidden',
    }}>
      {slide.elements.map((el, i) => {
        if (el._type === 'shape') return <ShapeEl key={el.id ?? i} el={el as EcmlShapeElement} />;
        if (el._type === 'image') return <ImageEl key={el.id ?? i} el={el as EcmlImageElement} />;
        if (el._type === 'text') return <TextEl key={el.id ?? i} el={el as EcmlTextElement} />;
        // audio elements have no visual — skip here (handled at slide level)
        return null;
      })}
    </div>
  );
};

export default EcmlSlideRenderer;
