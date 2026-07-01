import React from 'react';
import type { ContentPluginProps, ContentPluginRef } from '../plugin.interface';
import { COLORS } from '../../constants';
import { useIsTouch } from '../../hooks/useIsTouch';

const VideoPlugin = React.forwardRef<ContentPluginRef, ContentPluginProps>(
  ({ contentData, isMuted, dir, onReady, onFinished, onProgress, onInteract }, ref) => {
    const mediaRef = React.useRef<HTMLVideoElement | HTMLAudioElement>(null);
    const isAudio = contentData.mimeType === 'audio/mp3';
    const isTouch = useIsTouch();
    const onReadyRef = React.useRef(onReady);
    const onInteractRef = React.useRef(onInteract);

    const containerDivRef = React.useRef<HTMLDivElement>(null);
    const hasCalledReadyRef = React.useRef(false);

    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [localMuted, setLocalMuted] = React.useState(isMuted);
    const [playbackRate, setPlaybackRate] = React.useState(1);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    // Web: controls visible when hovering OR when paused.
    const [isHovering, setIsHovering] = React.useState(false);
    // Touch: controls visibility is toggled by tapping the video (NOT play/pause),
    // and auto-hidden while playing. Starts visible.
    const [touchControlsVisible, setTouchControlsVisible] = React.useState(true);
    const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearHideTimer = React.useCallback(() => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    }, []);

    // Auto-hide controls ~3s after a touch interaction, but only while playing.
    const scheduleHide = React.useCallback(() => {
      clearHideTimer();
      hideTimerRef.current = setTimeout(() => setTouchControlsVisible(false), 3000);
    }, [clearHideTimer]);

    // Clean up the timer on unmount.
    React.useEffect(() => clearHideTimer, [clearHideTimer]);

    React.useEffect(() => {
      const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener('fullscreenchange', onFsChange);
      return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    const toggleFullscreen = (e: React.MouseEvent) => {
      e.stopPropagation();
      const entering = !document.fullscreenElement;
      if (entering) {
        containerDivRef.current?.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
      onInteractRef.current?.('FULLSCREEN', { fullscreen: entering });
    };

    React.useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
    React.useEffect(() => { onInteractRef.current = onInteract; }, [onInteract]);

    React.useEffect(() => {
      setLocalMuted(isMuted);
      if (mediaRef.current) mediaRef.current.muted = isMuted;
    }, [isMuted]);

    // For locally downloaded content, resolver sets artifactUrl to basename and
    // basePath to the Capacitor webview directory. Reconstruct the full file URL.
    // streamingUrl is the directory path (old web-component convention) — ignore it locally.
    const url = contentData.isAvailableLocally && contentData.basePath && contentData.artifactUrl
      ? `${contentData.basePath.replace(/\/$/, '')}/${contentData.artifactUrl}`
      : (contentData.streamingUrl || contentData.artifactUrl);

    React.useEffect(() => {
      hasCalledReadyRef.current = false;
    }, [url]);

    const handleCanPlay = () => {
      if (!hasCalledReadyRef.current) {
        hasCalledReadyRef.current = true;
        onReadyRef.current();
      }
    };

    React.useImperativeHandle(ref, () => ({
      replay() {
        if (!mediaRef.current) return;
        hasCalledReadyRef.current = true;
        mediaRef.current.currentTime = 0;
        mediaRef.current.pause();
        setIsPlaying(false);
        onReadyRef.current();
      },
      mute(muted: boolean) {
        if (mediaRef.current) mediaRef.current.muted = muted;
        setLocalMuted(muted);
      },
      getProgress() {
        if (!mediaRef.current) return {};
        const el = mediaRef.current;
        return {
          currentTime: el.currentTime,
          duration: el.duration,
          percent: el.duration ? (el.currentTime / el.duration) * 100 : 0,
        };
      },
    }));

    const handleTimeUpdate = () => {
      if (!mediaRef.current) return;
      const el = mediaRef.current;
      setCurrentTime(el.currentTime);
      setDuration(el.duration || 0);
      if (onProgress) {
        onProgress({
          currentTime: el.currentTime,
          duration: el.duration,
          percent: el.duration ? (el.currentTime / el.duration) * 100 : 0
        });
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (isTouch) { setTouchControlsVisible(true); scheduleHide(); }
      onInteractRef.current?.('PLAY', { time: Math.floor(mediaRef.current?.currentTime ?? 0) });
    };

    const handlePause = () => {
      setIsPlaying(false);
      // Paused → keep controls up so the user can scrub / resume.
      if (isTouch) { clearHideTimer(); setTouchControlsVisible(true); }
      onInteractRef.current?.('PAUSE', { time: Math.floor(mediaRef.current?.currentTime ?? 0) });
    };

    const handleSeek = () => {
      onInteractRef.current?.('SEEK', { time: Math.floor(mediaRef.current?.currentTime ?? 0) });
    };

    const handleLoadedMetadata = () => {
      if (mediaRef.current) {
        setDuration(mediaRef.current.duration || 0);
      }
    };

    const togglePlayPause = (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      const el = mediaRef.current as HTMLVideoElement;
      if (!el) return;
      if (el.paused) {
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    };

    // Tap on the video surface.
    // Web (mouse): unchanged — a click toggles play/pause.
    // Touch: a tap reveals/hides the controls instead of pausing (native-app feel).
    //        Play/pause stays on the dedicated buttons.
    const handleSurfaceClick = (e: React.MouseEvent) => {
      if (!isTouch) { togglePlayPause(e); return; }
      e.stopPropagation();
      setTouchControlsVisible(prev => {
        const next = !prev;
        if (next && isPlaying) scheduleHide();
        else clearHideTimer();
        return next;
      });
    };

    // Keep controls on screen briefly after any touch control interaction.
    const bumpHide = () => { if (isTouch && isPlaying) scheduleHide(); };

    const skipForward = (e: React.MouseEvent) => {
      e.stopPropagation();
      const el = mediaRef.current;
      if (!el) return;
      el.currentTime = Math.min(el.duration || 0, el.currentTime + 10);
      bumpHide();
      onInteractRef.current?.('FORWARD', { time: Math.floor(el.currentTime) });
    };

    const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      const el = mediaRef.current;
      if (!el) return;
      const nextMuted = !el.muted;
      el.muted = nextMuted;
      setLocalMuted(nextMuted);
      bumpHide();
      onInteractRef.current?.('MUTE_TOGGLE', { muted: nextMuted });
    };

    const handleSpeedChange = (e: React.MouseEvent) => {
      e.stopPropagation();
      const el = mediaRef.current;
      if (!el) return;
      const speeds = [1, 1.5, 2];
      const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
      const nextSpeed = speeds[nextIdx];
      el.playbackRate = nextSpeed;
      setPlaybackRate(nextSpeed);
      bumpHide();
      onInteractRef.current?.('RATE_CHANGE', { rate: nextSpeed });
    };

    const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const el = mediaRef.current;
      if (!el) return;
      const percent = parseFloat(e.target.value);
      el.currentTime = (percent / 100) * (el.duration || 0);
      setCurrentTime(el.currentTime);
      bumpHide();
    };

    const formatTime = (timeInSeconds: number) => {
      if (isNaN(timeInSeconds)) return '0:00';
      const mins = Math.floor(timeInSeconds / 60);
      const secs = Math.floor(timeInSeconds % 60);
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Web: visible on hover or when paused. Touch: toggled by tap + auto-hide.
    const showControls = isTouch ? touchControlsVisible : (isHovering || !isPlaying);

    // Tap targets: ≥44px hit area on touch (Apple/Google HIG), original sizes on web.
    const centerBtn = isTouch ? 76 : 64;
    const playBtn   = isTouch ? 44 : 32;
    const iconBtn   = isTouch ? 44 : 28;
    const speedH    = isTouch ? 36 : 22;

    if (isAudio) {
      return (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '100%', background: COLORS.ivory, direction: dir,
        }}>
          <audio
            ref={mediaRef as React.Ref<HTMLAudioElement>}
            src={url}
            controls
            muted={localMuted}
            onCanPlay={handleCanPlay}
            onEnded={onFinished}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeeked={handleSeek}
            style={{ width: '90%', maxWidth: 480 }}
          />
        </div>
      );
    }

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    return (
      <div
        ref={containerDivRef}
        onClick={handleSurfaceClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          width: '100%',
          height: '100%',
          background: '#0b1219',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          direction: dir
        }}
      >
        <video
          ref={mediaRef as React.Ref<HTMLVideoElement>}
          src={url}
          muted={localMuted}
          playsInline
          onCanPlay={handleCanPlay}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onFinished}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={handleSeek}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* Controls overlay — no background tint on the overlay itself */}
        <div className={`sp-video-custom-controls ${!showControls ? 'faded' : ''}`}>
          {/* Top chrome — gradient only, no solid overlay */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 16px',
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <span style={{ flex: 1, fontSize: '13px', color: 'rgba(255,255,255,0.72)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {contentData.name || 'Video Content'}
            </span>
          </div>

          {/* Center play button (shown when paused) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            {!isPlaying && (
              <div
                onClick={togglePlayPause}
                style={{
                  width: `${centerBtn}px`,
                  height: `${centerBtn}px`,
                  background: 'rgba(255,255,255,0.12)',
                  border: '2px solid rgba(255,255,255,0.38)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <polygon points="6,3 20,12 6,21" />
                </svg>
              </div>
            )}
          </div>

          {/* Bottom control panel */}
          <div style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
            padding: '40px 16px 14px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Scrubber */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '11px', position: 'relative' }}>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercent}
                onChange={handleScrubberChange}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  height: '4px',
                  background: 'rgba(255,255,255,0.18)',
                  borderRadius: '4px',
                  outline: 'none',
                  cursor: 'pointer',
                  accentColor: 'var(--sp-brick)',
                  margin: 0
                }}
              />
            </div>

            {/* Controls row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Play / Pause */}
              <button
                onClick={togglePlayPause}
                style={{ width: `${playBtn}px`, height: `${playBtn}px`, border: 'none', background: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                )}
              </button>

              {/* Skip forward 10s */}
              <button
                onClick={skipForward}
                style={{ width: `${iconBtn}px`, height: `${iconBtn}px`, border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4"/>
                  <line x1="19" y1="5" x2="19" y2="19"/>
                </svg>
              </button>

              {/* Time */}
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div style={{ flex: 1 }}></div>

              {/* Mute */}
              <button
                onClick={toggleMute}
                style={{ width: `${iconBtn}px`, height: `${iconBtn}px`, border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                {localMuted ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                  </svg>
                )}
              </button>

              {/* Speed */}
              <div
                onClick={handleSpeedChange}
                style={{ height: `${speedH}px`, padding: isTouch ? '0 12px' : '0 8px', border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.82)', fontWeight: 700 }}>{playbackRate}×</span>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                style={{ width: `${iconBtn}px`, height: `${iconBtn}px`, border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                {isFullscreen ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="8 3 3 3 3 8"/><polyline points="21 3 16 3 16 8"/>
                    <polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Thin progress bar when controls hidden (playing, not hovering) */}
        {!showControls && isPlaying && (
          <div className="sp-video-progress-mini">
            <div className="sp-video-progress-mini-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        )}
      </div>
    );
  }
);

VideoPlugin.displayName = 'VideoPlugin';

export const VIDEO_PLUGIN_DEFINITION = {
  mimeTypes: ['video/mp4', 'video/webm', 'audio/mp3'],
  component: VideoPlugin,
};

export default VideoPlugin;
