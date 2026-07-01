import React from 'react';
import type { ContentPluginRef } from '../plugins/plugin.interface';
import PluginRenderer from '../plugins/PluginRenderer';
import Menu, { DotsIcon } from '../menu/Menu';
import type { ContentMetaData, PlayerAssets } from '../types';
import { COLORS } from '../constants';

interface Props {
  metadata: ContentMetaData;
  isMuted: boolean;
  language: string;
  dir: 'ltr' | 'rtl';
  assets?: PlayerAssets;
  menuBar?: boolean;
  controlsLocation?: 'top' | 'bottom' | 'default';
  downloadContent?: boolean;
  pluginRef: React.Ref<ContentPluginRef>;
  onReady(): void;
  onFinished(): void;
  onReplay(): void;
  onMuteToggle(): void;
  onExit(): void;
  onError(msg: string): void;
  onProgress(data: { currentTime?: number; percent?: number }): void;
  onInteract(subtype: string, extra?: Record<string, unknown>): void;
}

const VIDEO_TYPES = new Set(['video/x-youtube', 'video/mp4', 'video/webm', 'audio/mp3']);

const EPUB_TYPES = new Set(['application/epub', 'application/epub+zip']);

const HTML_TYPES = new Set([
  'application/vnd.ekstep.html-archive',
  'application/vnd.ekstep.h5p-archive',
  'application/vnd.ekstep.scorm-archive',
]);

const PlayingScreen: React.FC<Props> = ({
  metadata, isMuted, language, dir, assets, menuBar, controlsLocation, downloadContent, pluginRef,
  onReady, onFinished, onReplay, onMuteToggle, onExit, onError, onProgress, onInteract,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const isVideo = VIDEO_TYPES.has(metadata.mimeType);
  const isPdf = metadata.mimeType === 'application/pdf';
  const isEpub = EPUB_TYPES.has(metadata.mimeType);
  const isHtml = HTML_TYPES.has(metadata.mimeType);
  const isMultiSco = isHtml && !!(metadata.scoList && metadata.scoList.length > 1);
  const isEcml = metadata.mimeType === 'application/vnd.ekstep.ecml-archive';
  /* PDF, EPUB, Multi-SCO and ECML manage their own menu button. */
  const hasOwnMenu = isPdf || isEpub || isMultiSco || isEcml;
  /* menuBar===false hides ALL menu buttons (both shell and plugin-owned) */
  const showMenu = menuBar !== false;
  const iconStroke = isVideo ? 'rgba(255,255,255,0.85)' : COLORS.gray700;

  return (
    <div className="sp-playing-area sp-fade-in">
      <PluginRenderer
        pluginRef={pluginRef}
        contentData={metadata}
        isMuted={isMuted}
        language={language}
        dir={dir}
        assets={assets}
        menuBar={menuBar}
        controlsLocation={controlsLocation}
        downloadContent={downloadContent}
        onReady={onReady}
        onFinished={onFinished}
        onError={onError}
        onProgress={onProgress}
        onInteract={onInteract}
        onReplay={onReplay}
        onExit={onExit}
        onMuteToggle={onMuteToggle}
      />

      {showMenu && !menuOpen && !hasOwnMenu && (
        <button
          className={`sp-menu-btn${isVideo ? ' sp-menu-btn--video' : ''}`}
          onClick={() => setMenuOpen(true)}
          aria-label="Open options menu"
          aria-haspopup="dialog"
        >
          <DotsIcon stroke={iconStroke} />
        </button>
      )}

      {showMenu && menuOpen && !hasOwnMenu && (
        <Menu
          title={metadata.name}
          language={language}
          isMuted={isMuted}
          isVideo={isVideo}
          onReplay={onReplay}
          onMuteToggle={onMuteToggle}
          onExit={onExit}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default PlayingScreen;
