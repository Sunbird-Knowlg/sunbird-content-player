import React from 'react';
import type { ContentMetaData, PlayerAssets } from '../types';

export interface ContentPluginProps {
  contentData: ContentMetaData;
  isMuted: boolean;
  language: string;
  dir: 'ltr' | 'rtl';
  /** Offline asset paths — plugins use these instead of CDN when provided */
  assets?: PlayerAssets;
  /** Plugin → shell: assets loaded and content is ready to show */
  onReady(): void;
  /** Plugin → shell: content finished playing / completed */
  onFinished(): void;
  /** Plugin → shell: non-fatal error (e.g. network issue) */
  onError?(error: string): void;
  /** Plugin → shell: heartbeat progress data */
  onProgress?(data: ProgressData): void;
  /**
   * Plugin → shell: user interaction inside content.
   * Shell fires INTERACT telemetry + player event.
   * subtype: PLAY | PAUSE | SEEK | BUFFER | TOUCH | SCORM_INTERACT | etc.
   */
  onInteract?(subtype: string, extra?: Record<string, unknown>): void;
  /** Shell → plugin: replay the content from the start */
  onReplay?(): void;
  /** Shell → plugin: exit the player (fires EXIT telemetry) */
  onExit?(): void;
  /** Shell → plugin: toggle player mute state */
  onMuteToggle?(): void;
  /** When false, plugin must hide its own ⋮ menu button. Default: true. */
  menuBar?: boolean;
  /**
   * Initial controls bar position. 'top' → top bar, 'bottom' → bottom bar,
   * 'default'/undefined → floating default (layout B).
   */
  controlsLocation?: 'top' | 'bottom' | 'default';
  /**
   * Show the "Download" menu item (PDF / EPUB). Default: true.
   * When false, the plugin must hide its Download option.
   */
  downloadContent?: boolean;
}

export interface ProgressData {
  currentTime?: number;
  duration?: number;
  /** 0–100 */
  percent?: number;
}

export interface ContentPluginRef {
  /** Restart content from beginning */
  replay(): void;
  /** Toggle mute state */
  mute(muted: boolean): void;
  /** Optional: return current progress for heartbeat */
  getProgress?(): ProgressData;
}

export interface PluginDefinition {
  mimeTypes: string[];
  component: React.ForwardRefExoticComponent<
    ContentPluginProps & React.RefAttributes<ContentPluginRef>
  >;
}
