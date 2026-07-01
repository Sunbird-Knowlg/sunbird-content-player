import React from 'react';
import { t } from '../i18n/i18n';
import { COLORS } from '../constants';

interface Props {
  title: string;
  language: string;
  /** @deprecated mute removed from menu — kept optional so callers still compile */
  isMuted?: boolean;
  isVideo: boolean;
  onReplay(): void;
  /** @deprecated mute removed from menu — kept optional so callers still compile */
  onMuteToggle?(): void;
  onExit(): void;
  onClose(): void;
  hideToggleBtn?: boolean;
}

const Menu: React.FC<Props> = ({
  title, language, isVideo, onReplay, onExit, onClose, hideToggleBtn = false,
}) => {
  const firstItemRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    firstItemRef.current?.focus();
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const iconStroke = isVideo ? 'rgba(255,255,255,0.85)' : COLORS.gray700;
  const btnCls = `sp-menu-btn${isVideo ? ' sp-menu-btn--video' : ''}`;

  const handle = (fn: () => void) => () => { fn(); onClose(); };

  return (
    <>
      {/* Dismiss overlay */}
      <div className="sp-menu-overlay" onClick={onClose} aria-hidden="true" />

      {/* ⋮ button — keep visible while menu open */}
      {!hideToggleBtn && (
        <button
          className={btnCls}
          onClick={onClose}
          aria-label="Close menu"
          aria-expanded="true"
        >
          <DotsIcon stroke={iconStroke} />
        </button>
      )}

      {/* Dropdown */}
      <nav
        className="sp-menu-dropdown"
        role="dialog"
        aria-label={t(language, 'MENU_TITLE')}
      >
        <div className="sp-menu-header">{title}</div>

        <button
          className="sp-menu-item"
          ref={firstItemRef}
          onClick={handle(onReplay)}
        >
          <ReplayIcon />
          {t(language, 'REPLAY')}
        </button>

        <button
          className="sp-menu-item sp-menu-item--exit"
          onClick={handle(onExit)}
        >
          <ExitIcon />
          {t(language, 'EXIT')}
        </button>
      </nav>
    </>
  );
};

/* ---- SVG icons (Lucide/Feather style) ---- */
const DotsIcon: React.FC<{ stroke: string }> = ({ stroke }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth="2.2" strokeLinecap="round">
    <circle cx="12" cy="5" r="1" fill={stroke} />
    <circle cx="12" cy="12" r="1" fill={stroke} />
    <circle cx="12" cy="19" r="1" fill={stroke} />
  </svg>
);

const ReplayIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke={COLORS.gray700} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1,4 1,10 7,10" />
    <path d="M3.51,15a9,9,0,1,0,.49-3.26" />
  </svg>
);

const ExitIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export { DotsIcon };
export default Menu;
