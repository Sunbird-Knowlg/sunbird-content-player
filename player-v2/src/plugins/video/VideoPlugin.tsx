import React from 'react';
import videojs from 'video.js';
import type Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import type { ContentPluginProps, ContentPluginRef } from '../plugin.interface';
import { COLORS } from '../../constants';
import { useIsTouch } from '../../hooks/useIsTouch';

const VideoPlugin = React.forwardRef<ContentPluginRef, ContentPluginProps>(
  ({ contentData, isMuted, dir, onReady, onFinished, onProgress, onInteract }, ref) => {
    // Container where video.js mounts — React never renders <video> itself to avoid
    // React's reconciler overwriting video.js-managed class/style attributes on re-render.
    const vjsContainerRef = React.useRef<HTMLDivElement>(null);
    const playerRef = React.useRef<Player | null>(null);

    const isAudio = contentData.mimeType === 'audio/mp3';
    const isTouch = useIsTouch();

    const onReadyRef     = React.useRef(onReady);
    const onInteractRef  = React.useRef(onInteract);
    const onFinishedRef  = React.useRef(onFinished);
    const onProgressRef  = React.useRef(onProgress);
    React.useEffect(() => { onReadyRef.current    = onReady; },    [onReady]);
    React.useEffect(() => { onInteractRef.current = onInteract; }, [onInteract]);
    React.useEffect(() => { onFinishedRef.current = onFinished; }, [onFinished]);
    React.useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

    const containerDivRef      = React.useRef<HTMLDivElement>(null);
    const hasCalledReadyRef    = React.useRef(false);
    const audioElRef           = React.useRef<HTMLAudioElement>(null);

    const [isPlaying,           setIsPlaying]           = React.useState(false);
    const [currentTime,         setCurrentTime]         = React.useState(0);
    const [duration,            setDuration]            = React.useState(0);
    const [localMuted,          setLocalMuted]          = React.useState(isMuted);
    const [playbackRate,        setPlaybackRate]        = React.useState(1);
    const [isFullscreen,        setIsFullscreen]        = React.useState(false);
    const [isHovering,          setIsHovering]          = React.useState(false);
    const [touchControlsVisible,setTouchControlsVisible]= React.useState(true);
    const hideTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearHideTimer = React.useCallback(() => {
      if (hideTimerRef.current) { clearTimeout(hideTimerRef.current); hideTimerRef.current = null; }
    }, []);
    const scheduleHide = React.useCallback(() => {
      clearHideTimer();
      hideTimerRef.current = setTimeout(() => setTouchControlsVisible(false), 3000);
    }, [clearHideTimer]);
    React.useEffect(() => clearHideTimer, [clearHideTimer]);

    const url = contentData.isAvailableLocally && contentData.basePath && contentData.artifactUrl
      ? `${contentData.basePath.replace(/\/$/, '')}/${contentData.artifactUrl}`
      : (contentData.streamingUrl || contentData.artifactUrl);

    // Init video.js — create the <video> element in JS so React never reconciles it
    React.useEffect(() => {
      if (isAudio || !vjsContainerRef.current) return;

      // Create the <video> element imperatively — not via JSX — so React's reconciler
      // never re-applies className/style and overwrites video.js internals on re-render.
      const videoEl = document.createElement('video');
      videoEl.className = 'video-js';
      videoEl.setAttribute('playsinline', '');
      vjsContainerRef.current.appendChild(videoEl);

      const player = videojs(videoEl, {
        controls:  false,   // we render our own overlay
        autoplay:  false,
        preload:   'auto',
        fluid:     false,
        fill:      true,    // fills the container — requires position:relative on parent
        muted:     isMuted,
        sources:   url ? [{ src: url, type: contentData.mimeType }] : [],
      });

      player.on('canplay', () => {
        if (!hasCalledReadyRef.current) {
          hasCalledReadyRef.current = true;
          onReadyRef.current?.();
        }
      });
      player.on('loadedmetadata', () => setDuration(player.duration() || 0));
      player.on('timeupdate', () => {
        const ct  = player.currentTime() || 0;
        const dur = player.duration()    || 0;
        setCurrentTime(ct);
        setDuration(dur);
        onProgressRef.current?.({ currentTime: ct, duration: dur, percent: dur ? (ct / dur) * 100 : 0 });
      });
      player.on('play', () => {
        setIsPlaying(true);
        if (isTouch) { setTouchControlsVisible(true); scheduleHide(); }
        onInteractRef.current?.('PLAY', { time: Math.floor(player.currentTime() || 0) });
      });
      player.on('pause', () => {
        setIsPlaying(false);
        if (isTouch) { clearHideTimer(); setTouchControlsVisible(true); }
        onInteractRef.current?.('PAUSE', { time: Math.floor(player.currentTime() || 0) });
      });
      player.on('seeked', () => {
        onInteractRef.current?.('SEEK', { time: Math.floor(player.currentTime() || 0) });
      });
      player.on('ended',          () => onFinishedRef.current?.());
      player.on('fullscreenchange', () => setIsFullscreen(player.isFullscreen() || false));

      playerRef.current = player;

      return () => {
        hasCalledReadyRef.current = false;
        if (!player.isDisposed()) { player.dispose(); }
        playerRef.current = null;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAudio]);

    // Update src when url changes without re-creating player
    React.useEffect(() => {
      if (isAudio || !playerRef.current || !url) return;
      hasCalledReadyRef.current = false;
      playerRef.current.src([{ src: url, type: contentData.mimeType }]);
      playerRef.current.load();
    }, [url, contentData.mimeType, isAudio]);

    // Sync mute prop
    React.useEffect(() => {
      setLocalMuted(isMuted);
      playerRef.current?.muted(isMuted);
    }, [isMuted]);

    React.useImperativeHandle(ref, () => ({
      replay() {
        const p = playerRef.current;
        if (!p) return;
        hasCalledReadyRef.current = true;
        p.currentTime(0);
        p.pause();
        setIsPlaying(false);
        onReadyRef.current?.();
      },
      mute(muted: boolean) {
        playerRef.current?.muted(muted);
        setLocalMuted(muted);
      },
      getProgress() {
        const p = playerRef.current;
        if (!p) return {};
        const ct  = p.currentTime() || 0;
        const dur = p.duration()    || 0;
        return { currentTime: ct, duration: dur, percent: dur ? (ct / dur) * 100 : 0 };
      },
    }));

    const togglePlayPause = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const p = playerRef.current;
      if (!p) return;
      if (p.paused()) { p.play(); } else { p.pause(); }
    };

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

    const bumpHide = () => { if (isTouch && isPlaying) scheduleHide(); };

    const skipForward = (e: React.MouseEvent) => {
      e.stopPropagation();
      const p = playerRef.current;
      if (!p) return;
      const next = Math.min(p.duration() || 0, (p.currentTime() || 0) + 10);
      p.currentTime(next);
      bumpHide();
      onInteractRef.current?.('FORWARD', { time: Math.floor(next) });
    };

    const toggleMute = (e: React.MouseEvent) => {
      e.stopPropagation();
      const p = playerRef.current;
      if (!p) return;
      const next = !p.muted();
      p.muted(next);
      setLocalMuted(next);
      bumpHide();
      onInteractRef.current?.('MUTE_TOGGLE', { muted: next });
    };

    const handleSpeedChange = (e: React.MouseEvent) => {
      e.stopPropagation();
      const p = playerRef.current;
      if (!p) return;
      const speeds = [1, 1.5, 2];
      const nextIdx  = (speeds.indexOf(playbackRate) + 1) % speeds.length;
      const nextSpeed = speeds[nextIdx];
      p.playbackRate(nextSpeed);
      setPlaybackRate(nextSpeed);
      bumpHide();
      onInteractRef.current?.('RATE_CHANGE', { rate: nextSpeed });
    };

    const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const p = playerRef.current;
      if (!p) return;
      const t = (parseFloat(e.target.value) / 100) * (p.duration() || 0);
      p.currentTime(t);
      setCurrentTime(t);
      bumpHide();
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
      e.stopPropagation();
      const p = playerRef.current;
      if (!p) return;
      const entering = !p.isFullscreen();
      if (entering) { p.requestFullscreen(); } else { p.exitFullscreen(); }
      onInteractRef.current?.('FULLSCREEN', { fullscreen: entering });
    };

    const formatTime = (s: number) => {
      if (isNaN(s)) return '0:00';
      const m = Math.floor(s / 60);
      return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    };

    const showControls    = isTouch ? touchControlsVisible : (isHovering || !isPlaying);
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;
    const centerBtn = isTouch ? 76 : 64;
    const playBtn   = isTouch ? 44 : 32;
    const iconBtn   = isTouch ? 44 : 28;
    const speedH    = isTouch ? 36 : 22;

    // Audio: video.js not used — native <audio> is simpler and sufficient
    if (isAudio) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: COLORS.ivory, direction: dir }}>
          <audio
            ref={audioElRef}
            src={url}
            controls
            muted={localMuted}
            onCanPlay={() => { if (!hasCalledReadyRef.current) { hasCalledReadyRef.current = true; onReadyRef.current?.(); } }}
            onEnded={() => onFinishedRef.current?.()}
            onTimeUpdate={(e) => {
              const el = e.currentTarget;
              onProgressRef.current?.({ currentTime: el.currentTime, duration: el.duration, percent: el.duration ? (el.currentTime / el.duration) * 100 : 0 });
            }}
            style={{ width: '90%', maxWidth: 480 }}
          />
        </div>
      );
    }

    return (
      <div
        ref={containerDivRef}
        onClick={handleSurfaceClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          width: '100%', height: '100%', background: '#0b1219',
          position: 'relative', overflow: 'hidden',
          cursor: 'pointer', direction: dir,
        }}
      >
        {/* video.js mounts here — position:relative required for fill:true */}
        <div
          ref={vjsContainerRef}
          className="sp-video-vjs-container"
          style={{ width: '100%', height: '100%', position: 'relative' }}
        />

        {/* Custom controls overlay */}
        <div className={`sp-video-custom-controls ${!showControls ? 'faded' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)', width: '100%', boxSizing: 'border-box' }}>
            <span style={{ flex: 1, fontSize: '13px', color: 'rgba(255,255,255,0.72)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {contentData.name || 'Video Content'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            {!isPlaying && (
              <div onClick={togglePlayPause} style={{ width: `${centerBtn}px`, height: `${centerBtn}px`, background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.38)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'transform 0.15s ease' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21" /></svg>
              </div>
            )}
          </div>

          <div style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', padding: '40px 16px 14px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '11px', position: 'relative' }}>
              <input
                type="range" min="0" max="100" value={progressPercent}
                onChange={handleScrubberChange}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.18)', borderRadius: '4px', outline: 'none', cursor: 'pointer', accentColor: 'var(--sp-brick)', margin: 0 }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={togglePlayPause} style={{ width: `${playBtn}px`, height: `${playBtn}px`, border: 'none', background: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                {isPlaying
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21" /></svg>
                }
              </button>

              <button onClick={skipForward} style={{ width: `${iconBtn}px`, height: `${iconBtn}px`, border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                </svg>
              </button>

              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              <div style={{ flex: 1 }} />

              <button onClick={toggleMute} style={{ width: `${iconBtn}px`, height: `${iconBtn}px`, border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                {localMuted
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                }
              </button>

              <div onClick={handleSpeedChange} style={{ height: `${speedH}px`, padding: isTouch ? '0 12px' : '0 8px', border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.08)', borderRadius: '5px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.82)', fontWeight: 700 }}>{playbackRate}×</span>
              </div>

              <button onClick={toggleFullscreen} style={{ width: `${iconBtn}px`, height: `${iconBtn}px`, border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                {isFullscreen
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 3 3 3 3 8"/><polyline points="21 3 16 3 16 8"/><polyline points="3 16 3 21 8 21"/><polyline points="16 21 21 21 21 16"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                }
              </button>
            </div>
          </div>
        </div>

        {!showControls && isPlaying && (
          <div className="sp-video-progress-mini">
            <div className="sp-video-progress-mini-fill" style={{ width: `${progressPercent}%` }} />
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
