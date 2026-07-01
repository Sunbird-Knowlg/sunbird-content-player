import React from 'react';
import './player.css';

import type { PlayerConfig, PlayerScreen, PlayerEventPayload } from './types';
import type { TelemetryEvent } from './telemetry/telemetry.types';
import type { ContentPluginRef, PluginDefinition } from './plugins/plugin.interface';
import type { ContentCursor } from './services/ContentCursor';
import type { PlaySummary } from './telemetry/TelemetryService';

import { PluginRegistry, PluginRegistryContext } from './plugins/plugin-registry';
import { HTML_PLUGIN_DEFINITION } from './plugins/html/HtmlPlugin';
import { YOUTUBE_PLUGIN_DEFINITION } from './plugins/youtube/YoutubePlugin';
import { VIDEO_PLUGIN_DEFINITION } from './plugins/video/VideoPlugin';
import { PDF_PLUGIN_DEFINITION } from './plugins/pdf/PdfPlugin';
import { EPUB_PLUGIN_DEFINITION } from './plugins/epub/EpubPlugin';
import { ECML_PLUGIN_DEFINITION } from './plugins/ecml/EcmlPlugin';

import { TelemetryService } from './telemetry/TelemetryService';
import { TelemetryProvider } from './telemetry/TelemetryContext';

import LoadingScreen from './screens/LoadingScreen';
import PlayingScreen from './screens/PlayingScreen';
import EndScreen from './screens/EndScreen';

import { getDir } from './i18n/i18n';
import { PLAYER_EVENTS, HEARTBEAT_INTERVAL_MS } from './constants';

export interface PlayerShellProps {
  playerConfig: PlayerConfig;
  cursor?: ContentCursor;
  onPlayerEvent?(event: PlayerEventPayload): void;
  onTelemetryEvent?(event: TelemetryEvent): void;
}

function buildRegistry(extraPlugins?: PluginDefinition[]): PluginRegistry {
  const reg = new PluginRegistry();
  extraPlugins?.forEach(p => reg.register(p));
  reg.register(HTML_PLUGIN_DEFINITION as PluginDefinition);
  reg.register(YOUTUBE_PLUGIN_DEFINITION as PluginDefinition);
  reg.register(VIDEO_PLUGIN_DEFINITION as PluginDefinition);
  reg.register(PDF_PLUGIN_DEFINITION as PluginDefinition);
  reg.register(EPUB_PLUGIN_DEFINITION as PluginDefinition);
  reg.register(ECML_PLUGIN_DEFINITION as PluginDefinition);
  return reg;
}

const PlayerShell: React.FC<PlayerShellProps> = ({
  playerConfig, cursor = null, onPlayerEvent, onTelemetryEvent,
}) => {
  const { metadata, context, config = {} } = playerConfig;
  const language = config.language ?? 'en';
  const dir      = getDir(language);

  const [screen,          setScreen]          = React.useState<PlayerScreen>('loading');
  const [isMuted,         setIsMuted]         = React.useState(false);
  const [loadingProgress, setLoadingProgress] = React.useState(5);
  const [timeSpentSec,    setTimeSpentSec]     = React.useState(0);

  const pluginRef       = React.useRef<ContentPluginRef>(null);
  const telemetryRef    = React.useRef<TelemetryService | null>(null);
  const onTelemetryEventRef = React.useRef(onTelemetryEvent);
  React.useEffect(() => { onTelemetryEventRef.current = onTelemetryEvent; }, [onTelemetryEvent]);
  const playerDivRef    = React.useRef<HTMLDivElement>(null);
  /* Accumulate play-summary data from plugin progress callbacks */
  const playSummaryRef  = React.useRef<Partial<PlaySummary>>({});
  /* Wall-clock start time — set in handleContentReady, independent of telemetry init */
  const playStartTimeRef = React.useRef<number>(0);
  /* Guards END so it fires exactly once per play session (reset on replay/new session) */
  const endFiredRef = React.useRef(false);
  /* compact = true when player height ≤ 420px — shrink fonts/elements */
  const [compact, setCompact] = React.useState(false);

  const registry = React.useMemo(
    () => buildRegistry(config.plugins),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /*
   * Create the telemetry service SYNCHRONOUSLY (during render), not in an effect.
   * Plugins whose onReady fires synchronously (e.g. ECML with an inline body) call
   * handleContentReady BEFORE a parent useEffect would have run — if the service were
   * created in an effect, telemetryRef.current would still be null at that moment and
   * START + HEARTBEAT would be silently skipped. Creating it here guarantees it exists.
   */
  if (!telemetryRef.current) {
    telemetryRef.current = new TelemetryService(
      context, metadata, cursor,
      (evt) => onTelemetryEventRef.current?.(evt),
      config.telemetry?.batchSize,
    );
  }
  React.useEffect(() => {
    return () => { telemetryRef.current?.destroy(); };
  }, []);

  /* ResizeObserver — sets compact=true when player height ≤ 420px */
  React.useEffect(() => {
    const el = playerDivRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const h = entries[0]?.contentRect.height ?? 9999;
      setCompact(h <= 420);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    if (screen !== 'loading') return;
    /* Smoothly ease the load indicator from 5% toward ~92% (decelerating) while
       the plugin loads, then it snaps to 'playing' on ready. The plugin load
       path doesn't expose real byte progress, so this is an eased estimate —
       still a clearer "it's working / how far" signal than a static bar. */
    let p = 5;
    setLoadingProgress(5);
    const id = setInterval(() => {
      p = Math.min(92, p + Math.max(0.5, (92 - p) * 0.1));
      setLoadingProgress(Math.round(p));
    }, 180);
    return () => clearInterval(id);
  }, [screen]);

  const emit = React.useCallback((eid: string, edata?: Record<string, unknown>) => {
    onPlayerEvent?.({ eid, edata, ts: Date.now() });
  }, [onPlayerEvent]);

  /* ------------------------------------------------------------------ */
  /* Lifecycle handlers — timing + telemetry mirrors old baseLauncher    */
  /* ------------------------------------------------------------------ */

  const handleContentReady = React.useCallback(() => {
    emit(PLAYER_EVENTS.CONTENT_READY);
    if (playStartTimeRef.current > 0) {
      return;
    }
    playSummaryRef.current = {};
    playStartTimeRef.current = Date.now(); // wall-clock start — survives telemetry init race
    endFiredRef.current = false;           // new session → allow END to fire again
    setScreen('playing');
    const svc = telemetryRef.current;
    if (svc) {
      svc.start();                        // → START telemetry (each session)
      svc.startHeartbeat(
        HEARTBEAT_INTERVAL_MS,
        () => pluginRef.current?.getProgress?.() ?? {},
      );
    }
  }, [emit]);

  /** Fire END once per session (stops heartbeat, flips course state via progress). */
  const fireEnd = React.useCallback((endpageSeen: boolean) => {
    const svc = telemetryRef.current;
    if (!svc || endFiredRef.current) return;
    svc.stopHeartbeat();
    svc.end(playSummaryRef.current, endpageSeen);
    endFiredRef.current = true;
  }, []);

  const handleContentFinished = React.useCallback(() => {
    setScreen(prev => {
      if (prev === 'finished') return prev;

      const svc = telemetryRef.current;
      // Use wall-clock ref as primary source — avoids race where svc.start() wasn't called yet
      const elapsed = playStartTimeRef.current > 0
        ? Math.round((Date.now() - playStartTimeRef.current) / 1000)
        : (svc?.getElapsedSeconds() ?? 0);
      setTimeSpentSec(elapsed);
      /*
       * END fires here with endpageSeen=true (end page is about to show).
       * Matches old player: endTelemetry() → dispatchEvent("renderer:endpage:show").
       * Guard against a prior END (e.g. ECML already ended on submit) so the player
       * CONTENT_FINISHED event + END telemetry fire exactly once per session.
       */
      if (!endFiredRef.current) {
        emit(PLAYER_EVENTS.CONTENT_FINISHED);
        fireEnd(true);
      }
      return 'finished';
    });
  }, [emit, fireEnd]);

  const handleReplay = React.useCallback(() => {
    emit(PLAYER_EVENTS.REPLAY);
    const svc = telemetryRef.current;
    /* Matches old player's menu replay (OverlayManager.actionReplay): only
       INTERACT(TOUCH, id=replay) + a fresh START — NO END telemetry. (The old
       end() call there is commented out.) END is reserved for genuine
       completion, so replaying never marks the content complete. */
    svc?.interact('TOUCH', 'replay', '');
    svc?.stopHeartbeat();         // stop the prior session's heartbeat without an END

    playStartTimeRef.current = 0; // Reset ready flag/start time for replay session
    endFiredRef.current = false;  // Allow the replayed session to fire its own END

    const mimeType = metadata.mimeType;
    // PDF/EPUB replay must run while element is visible — scrollTop reset fails on hidden elements
    const isInstant = [
      'video/x-youtube', 'video/mp4', 'video/webm', 'audio/mp3',
      'application/pdf', 'application/epub', 'application/epub+zip',
      'application/vnd.ekstep.ecml-archive',
    ].includes(mimeType);
    if (isInstant) {
      pluginRef.current?.replay();
    } else {
      setScreen('loading');
      setTimeout(() => { pluginRef.current?.replay(); }, 0);
    }
  }, [emit, metadata.mimeType, fireEnd]);

  const handleMuteToggle = React.useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      pluginRef.current?.mute(next);
      emit(PLAYER_EVENTS.MUTE_TOGGLE, { muted: next });
      telemetryRef.current?.interact('TOUCH', next ? 'mute' : 'unmute', '', { muted: next });
      return next;
    });
  }, [emit]);

  const handleExit = React.useCallback(() => {
    /* Old renderer fired NO END on exit — END only on completion/endpage. So
       exit just logs INTERACT(TOUCH, id=exit) and emits the EXIT player event;
       the heartbeat is stopped without an END so exiting never records
       completion/progress as a finished session. */
    telemetryRef.current?.interact('TOUCH', 'exit', '');
    telemetryRef.current?.stopHeartbeat();
    emit(PLAYER_EVENTS.EXIT, { type: 'EXIT', endpageSeen: false });
  }, [emit]);

  const handleDone = React.useCallback(() => {
    /* endpageSeen=true — user confirmed completion from end page */
    telemetryRef.current?.interact('TOUCH', 'done', '');
    fireEnd(true);
    /*
     * Emit EXIT (not just DONE) so the host leaves the player: the mobile app
     * unlocks orientation ONLY on a normalized eid === 'EXIT'. The old player's
     * end-page close emitted the EXIT player event for this exact reason; the
     * end screen's button is labelled "Exit" too. DONE is kept as a secondary
     * marker for any listener that distinguishes completion-close from mid-exit.
     */
    emit(PLAYER_EVENTS.DONE);
    emit(PLAYER_EVENTS.EXIT, { type: 'EXIT', endpageSeen: true });
  }, [emit, fireEnd]);

  const handleError = React.useCallback((msg: string) => {
    telemetryRef.current?.error(msg);
    emit(PLAYER_EVENTS.ERROR, { message: msg });
  }, [emit]);

  /**
   * Accumulate play-summary from plugin progress callbacks.
   * Maps to old contentPlaySummary(): totallength, visitedlength, visitedcontentend, totalseekedlength
   */
  const handleProgress = React.useCallback((data: { currentTime?: number; duration?: number; percent?: number }) => {
    const s = playSummaryRef.current;
    if (data.duration)     s.totallength     = Math.round(data.duration);
    if (data.currentTime)  s.visitedlength   = Math.round(data.currentTime);
    if (data.duration && data.currentTime) {
      const expectedEnd = data.duration * 0.9; // 90% threshold (old: bufferToAchieveProgress=10)
      s.visitedcontentend = data.currentTime >= expectedEnd;
    }
  }, []);

  /**
   * Interact from inside content (video/youtube play/pause/seek, PDF/EPUB nav,
   * SCORM events, ECML scoring). Aligns with the reference players (pdf/video/epub):
   * the action lives in edata.id (lowercased), type='TOUCH', subtype='' (empty).
   *  - ASSESS      → dedicated ASSESS telemetry event (not a plain INTERACT)
   *  - PAGE_CHANGE → IMPRESSION (per-page view)
   *  - everything else → INTERACT with id = lowercased action token
   */
  const handleInteract = React.useCallback((subtype: string, extra?: Record<string, unknown>) => {
    const svc = telemetryRef.current;
    if (!svc) return;

    /* ECML / question scoring → dedicated ASSESS event (per question) */
    if (subtype === 'ASSESS') {
      const score    = Number(extra?.score ?? 0);
      const maxScore = Number(extra?.maxScore ?? 0);
      const passVal  = extra?.pass;
      const pass: 'Yes' | 'No' =
        passVal === true || passVal === 'Yes' ? 'Yes'
        : passVal === false || passVal === 'No' ? 'No'
        : score > 0 ? 'Yes' : 'No';
      svc.assess({
        questionId: String(extra?.questionId ?? ''),
        qtype:      extra?.qtype as string | undefined,
        index:      extra?.index as number | undefined,
        score, maxScore, pass,
        resvalues:  extra?.resvalues as Array<Record<string, unknown>> | undefined,
        title:      extra?.title as string | undefined,
      });
      emit('player:interact', { subtype: 'ASSESS', ...extra });
      return;
    }

    /*
     * Final assessment submit → stash score and fire completion END (endpageSeen=true,
     * progress=100). Matches the old player, which ends/completes on submit rather than
     * waiting for a separate Close click — so course content state flips to "completed".
     */
    if (subtype === 'ASSESS_SUBMIT') {
      playSummaryRef.current.score    = Number(extra?.score ?? 0);
      playSummaryRef.current.maxscore = Number(extra?.maxScore ?? 0);
      svc.interact('TOUCH', 'assess_submit', '', extra);
      emit('player:interact', { id: 'assess_submit', ...extra });
      /* Fire the player CONTENT_FINISHED event too (→ portal END) so completion/score
         hooks run on submit, not only on a later Close click. */
      if (!endFiredRef.current) emit(PLAYER_EVENTS.CONTENT_FINISHED);
      fireEnd(true);
      return;
    }

    /* Page navigation → IMPRESSION (mirrors reference pdf/epub per-page views) */
    if (subtype === 'PAGE_CHANGE') {
      svc.impression(String(extra?.page ?? ''), extra);
      emit('player:interact', { subtype: 'PAGE_CHANGE', ...extra });
      return;
    }

    /* INTERACT — action in edata.id (lowercased), type 'TOUCH', subtype '' */
    let id = subtype.toLowerCase();
    if (subtype === 'SEEK')              id = 'drag';                       // reference calls seek "drag"
    else if (subtype === 'MUTE_TOGGLE') id = extra?.muted ? 'mute' : 'unmute';
    svc.interact('TOUCH', id, '', extra);
    emit('player:interact', { id, ...extra });
  }, [emit, fireEnd]);

  return (
    <PluginRegistryContext.Provider value={registry}>
      <TelemetryProvider service={telemetryRef.current!}>
        <div
          ref={playerDivRef}
          className="sp-player"
          dir={dir}
          lang={language}
          role="main"
          aria-label={metadata.name}
        >
          {screen === 'loading' && (
            <LoadingScreen
              title={metadata.name}
              language={language}
              progress={loadingProgress}
              compact={compact}
            />
          )}

          <div style={{ display: screen === 'playing' ? 'block' : 'none', width: '100%', height: '100%' }}>
            <PlayingScreen
              metadata={metadata}
              isMuted={isMuted}
              language={language}
              dir={dir}
              assets={config.assets}
              menuBar={config.menuBar}
              controlsLocation={config.controlsLocation}
              downloadContent={config.downloadContent}
              pluginRef={pluginRef}
              onReady={handleContentReady}
              onFinished={handleContentFinished}
              onReplay={handleReplay}
              onMuteToggle={handleMuteToggle}
              onExit={handleExit}
              onError={handleError}
              onProgress={handleProgress}
              onInteract={handleInteract}
            />
          </div>

          {screen === 'finished' && (
            <EndScreen
              title={metadata.name}
              language={language}
              timeSpentSec={timeSpentSec}
              compact={compact}
              onReplay={handleReplay}
              onDone={handleDone}
            />
          )}
        </div>
      </TelemetryProvider>
    </PluginRegistryContext.Provider>
  );
};

export default PlayerShell;
