import React from 'react';
import type { ContentMetaData } from '../types';
import { t, getMimeTypeLabel, formatDuration } from '../i18n/i18n';
import { COLORS } from '../constants';

interface Props {
  metadata: ContentMetaData;
  language: string;
  onStart(): void;
}

const StartScreen: React.FC<Props> = ({ metadata, language, onStart }) => {
  const typeLabel = getMimeTypeLabel(language, metadata.mimeType);
  const durationStr = formatDuration(language, metadata.duration);
  const meta = [
    durationStr,
    ...(metadata.gradeLevel ?? []),
    metadata.subject,
  ].filter(Boolean).join(' · ');

  return (
    <div className="sp-canvas sp-fade-in">
      <div className="sp-card">
        {/* Thumbnail */}
        <div className="sp-thumbnail">
          {metadata.thumbnail && (
            <img src={metadata.thumbnail} alt="" className="sp-thumbnail-img" />
          )}
          <div className="sp-thumbnail-vignette" />
          <div className="sp-play-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill={COLORS.white}>
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
        </div>

        {/* Badge */}
        <span className="sp-badge">{typeLabel}</span>

        {/* Title */}
        <h1 className="sp-title">{metadata.name}</h1>

        {/* Metadata */}
        {meta && <p className="sp-meta">{meta}</p>}

        {/* Start button */}
        <button
          className="sp-btn-primary"
          onClick={onStart}
          aria-label={`${t(language, 'START')} — ${metadata.name}`}
        >
          {t(language, 'START')}
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
