import React from 'react';
import type { ContentPluginProps, ContentPluginRef } from '../plugin.interface';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function extractYoutubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return url;
}

let ytApiLoaded = false;
const ytReadyCallbacks: Array<() => void> = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (ytApiLoaded && window.YT?.Player) { resolve(); return; }
    ytReadyCallbacks.push(resolve);
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => {
      ytApiLoaded = true;
      ytReadyCallbacks.forEach(cb => cb());
      ytReadyCallbacks.length = 0;
    };
  });
}

const YoutubePlugin = React.forwardRef<ContentPluginRef, ContentPluginProps>(
  ({ contentData, isMuted, dir, onReady, onFinished, onError, onInteract }, ref) => {
    const containerId = React.useRef(`yt-player-${Math.random().toString(36).slice(2)}`);
    const playerRef   = React.useRef<any>(null);
    const onReadyRef  = React.useRef(onReady);
    const onInteractRef = React.useRef(onInteract);
    React.useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
    React.useEffect(() => { onInteractRef.current = onInteract; }, [onInteract]);

    React.useImperativeHandle(ref, () => ({
      replay() {
        if (!playerRef.current) return;
        playerRef.current.seekTo(0, true);
        playerRef.current.pauseVideo?.();
        onReadyRef.current();
      },
      mute(muted: boolean) {
        if (!playerRef.current) return;
        if (muted) playerRef.current.mute?.();
        else        playerRef.current.unMute?.();
      },
      getProgress() {
        if (!playerRef.current) return {};
        const current = playerRef.current.getCurrentTime?.() ?? 0;
        const dur     = playerRef.current.getDuration?.() ?? 0;
        return { currentTime: current, duration: dur, percent: dur > 0 ? (current / dur) * 100 : 0 };
      },
    }));

    React.useEffect(() => {
      const videoId = extractYoutubeId(contentData.artifactUrl);
      let mounted = true;

      loadYouTubeAPI().then(() => {
        if (!mounted) return;
        playerRef.current = new window.YT.Player(containerId.current, {
          videoId,
          playerVars: { autoplay: 0, rel: 0, modestbranding: 1, enablejsapi: 1 },
          events: {
            onReady: (e: any) => {
              if (!mounted) return;
              if (isMuted) e.target.mute();
              onReadyRef.current();
            },
            onStateChange: (e: any) => {
              if (!mounted) return;
              const YTState = window.YT.PlayerState;
              const currentTime = playerRef.current?.getCurrentTime?.() ?? 0;
              switch (e.data) {
                case YTState.PLAYING:
                  onInteractRef.current?.('PLAY', { time: Math.floor(currentTime) });
                  break;
                case YTState.PAUSED:
                  onInteractRef.current?.('PAUSE', { time: Math.floor(currentTime) });
                  break;
                case YTState.BUFFERING:
                  onInteractRef.current?.('BUFFER', { time: Math.floor(currentTime) });
                  break;
                case YTState.ENDED:
                  onFinished();
                  break;
              }
            },
            onError: (e: any) => {
              onError?.(`YouTube player error code: ${e.data}`);
            },
          },
        });
      });

      return () => {
        mounted = false;
        playerRef.current?.destroy?.();
        playerRef.current = null;
      };
    // Re-mount only when video ID changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentData.artifactUrl]);

    React.useEffect(() => {
      if (!playerRef.current) return;
      if (isMuted) playerRef.current.mute?.();
      else         playerRef.current.unMute?.();
    }, [isMuted]);

    return (
      <div style={{ width: '100%', height: '100%', background: '#0a0a0a', direction: dir }}>
        <div id={containerId.current} style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }
);

YoutubePlugin.displayName = 'YoutubePlugin';

export const YOUTUBE_PLUGIN_DEFINITION = {
  mimeTypes: ['video/x-youtube'],
  component: YoutubePlugin,
};

export default YoutubePlugin;
