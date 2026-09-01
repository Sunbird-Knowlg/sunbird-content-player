import React from 'react';
import { COLORS } from '../../../constants';

/**
 * Shared white question card — used by every question type so the question
 * always sits in its own white panel, consistent across all templateTypes.
 * No icon/hamburger. Just eyebrow + question text/image.
 */
export const QuestionCard: React.FC<{
  eyebrow: string;
  text?: string;
  image?: string;
  /** smaller heading for compact layouts */
  compact?: boolean;
}> = ({ eyebrow, text, image, compact }) => (
  <div style={{
    background: COLORS.white, borderRadius: 16, padding: compact ? '14px 18px' : '18px 20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${COLORS.gray100}`, flexShrink: 0,
  }}>
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: '#c8b8a9', textTransform: 'uppercase', margin: '0 0 6px' }}>
      {eyebrow}
    </p>
    {text && (
      <h3 style={{ fontSize: compact ? 'clamp(15px,4vw,18px)' : 'clamp(17px,4.6vw,22px)', fontWeight: 600, color: COLORS.obsidian, letterSpacing: '-0.01em', margin: 0, lineHeight: 1.32, borderLeft: '3px solid var(--sp-brick, #a85236)', paddingLeft: compact ? 10 : 14 }}
        dangerouslySetInnerHTML={{ __html: text }} />
    )}
    {image && (
      <img src={image} alt="question" style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 8, marginTop: 10, objectFit: 'contain' }} />
    )}
  </div>
);
