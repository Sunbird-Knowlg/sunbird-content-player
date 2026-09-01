import React from 'react';
import type { ContentPluginProps, ContentPluginRef } from '../plugin.interface';
import type { ScoItem } from '../../types';
import { COLORS, FONT_FAMILY } from '../../constants';
import { useIsTouch } from '../../hooks/useIsTouch';
import { t } from '../../i18n/i18n';

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

interface ScormState {
  [key: string]: string;
}

/* ------------------------------------------------------------------ */
/* URL helpers                                                           */
/* ------------------------------------------------------------------ */

/**
 * Returns the base directory URL (no trailing slash) for a SCORM/HTML package.
 * SCO hrefs are appended to this: `${baseUrl}/${sco.href}`
 */
function getBaseUrl(artifactUrl: string, streamingUrl?: string): string {
  if (streamingUrl) {
    return streamingUrl.replace(/\/$/, '');
  }
  /* zip artifact → strip filename */
  if (artifactUrl.endsWith('.zip')) {
    return artifactUrl.replace(/\/[^/]+\.zip$/, '');
  }
  /* directory-like URL */
  return artifactUrl.replace(/\/[^/]+\.[a-z0-9]+$/i, '').replace(/\/$/, '');
}

/** Proxy CDN URLs through Vite dev server if VITE_CDN_PROXY is configured */
function maybeSameOrigin(url: string): string {
  try {
    const cdnProxy = typeof __CDN_PROXY__ !== 'undefined' ? __CDN_PROXY__ : '';
    if (!cdnProxy || !url.startsWith(cdnProxy)) return url;
    return `/content-proxy${url.slice(cdnProxy.length)}`;
  } catch { return url; }
}

/* ------------------------------------------------------------------ */
/* SCO list helpers                                                      */
/* ------------------------------------------------------------------ */

function buildScoList(contentData: ContentPluginProps['contentData']): ScoItem[] {
  /* Use scoList from metadata if present */
  if (contentData.scoList && contentData.scoList.length > 0) {
    return contentData.scoList;
  }
  /* Single-SCO fallback — matches old player's default */
  return [{
    identifier: 'default',
    title:      contentData.name,
    href:       contentData.launchFile || 'index.html',
  }];
}

function scoUrl(baseUrl: string, sco: ScoItem): string {
  return maybeSameOrigin(`${baseUrl}/${sco.href}`);
}

/* ------------------------------------------------------------------ */
/* SCORM API bridge                                                      */
/* ------------------------------------------------------------------ */

/**
 * Builds the SCORM 1.2 window.API object.
 * Mirrors old player's setupScormAPI() + per-SCO state management.
 *
 * Key behaviours:
 *  - Per-SCO state: allScoStates[scoId]
 *  - LMSSetValue(lesson_status = completed): compute overall; end if all SCOs done
 *  - LMSFinish on non-last SCO: just log; on last SCO: fire onFinished
 *  - computeOverallStatus: aggregate all SCO statuses
 */
function buildScormAPI(opts: {
  allScoStates:   React.MutableRefObject<Record<string, ScormState>>;
  getActiveScoId: () => string;
  getScoList:     () => ScoItem[];
  getCurrentScoIndex: () => number;
  onFinished:     () => void;
  onInteract:     ((sub: string, extra?: Record<string, unknown>) => void) | undefined;
  onProgress:     ((d: { percent?: number }) => void) | undefined;
  replayingRef:   React.MutableRefObject<boolean>;
}) {
  const { allScoStates, getActiveScoId, getScoList, getCurrentScoIndex,
          onFinished, onInteract, onProgress, replayingRef } = opts;

  function getState(): ScormState {
    const id = getActiveScoId();
    if (!allScoStates.current[id]) allScoStates.current[id] = {};
    return allScoStates.current[id];
  }

  function computeOverallStatus(): string {
    const statuses = getScoList().map(s =>
      allScoStates.current[s.identifier]?.['cmi.core.lesson_status'] || 'not attempted'
    );
    if (statuses.some(s => s === 'failed'))                     return 'failed';
    if (statuses.every(s => s === 'completed' || s === 'passed')) return 'completed';
    return 'incomplete';
  }

  return {
    LMSInitialize(_: string) {
      onInteract?.('SCORM_INITIALIZE', { scoId: getActiveScoId() });
      return 'true';
    },
    LMSGetValue(key: string) {
      const val = getState()[key];
      if (key === 'cmi.core.lesson_status' && !val) return 'not attempted';
      return val !== undefined ? String(val) : '';
    },
    LMSSetValue(key: string, value: string) {
      getState()[key] = String(value);

      if (key === 'cmi.core.lesson_status') {
        onInteract?.('SCORM_PROGRESS', { key, value, scoId: getActiveScoId() });
        /* Check overall completion across ALL SCOs */
        const overall = computeOverallStatus();
        if ((overall === 'completed' || overall === 'passed' || overall === 'failed')
            && !replayingRef.current) {
          setTimeout(onFinished, 300);
        }
      }
      if (key === 'cmi.core.score.raw') {
        onProgress?.({ percent: parseFloat(String(value)) });
        onInteract?.('SCORM_SCORE', { score: value, scoId: getActiveScoId() });
      }
      if (key.startsWith('cmi.interactions.') && key.endsWith('.result')) {
        onInteract?.('SCORM_INTERACTION', { key, value });
      }
      return 'true';
    },
    LMSCommit(_: string) {
      onInteract?.('SCORM_COMMIT', { scoId: getActiveScoId() });
      return 'true';
    },
    LMSFinish(_: string) {
      getState()['_finished'] = 'true';
      const isLast = getCurrentScoIndex() === getScoList().length - 1;
      if (isLast) {
        /* Last SCO finished — fire overall completion (guarded during replay) */
        onInteract?.('SCORM_FINISH', { scoId: getActiveScoId(), isLast: true });
        if (!replayingRef.current) setTimeout(onFinished, 300);
      } else {
        /* Non-last SCO — just log, navigation handled by multi-SCO UI */
        onInteract?.('SCORM_FINISH', { scoId: getActiveScoId(), isLast: false });
      }
      return 'true';
    },
    LMSGetLastError()              { return '0'; },
    LMSGetErrorString(_e: string)  { return 'No error'; },
    LMSGetDiagnostic(_e: string)   { return 'No diagnostic'; },
  };
}

/* ------------------------------------------------------------------ */
/* Compat shim injected into same-origin iframes                        */
/* ------------------------------------------------------------------ */

function injectCompatShim(iframeWin: Window): void {
  try {
    if (!(iframeWin as unknown as Record<string, unknown>).EkstepRendererAPI) {
      (iframeWin as unknown as Record<string, unknown>).EkstepRendererAPI = {};
    }
    (iframeWin as unknown as Record<string, { dispatchEvent?: unknown }>)
      .EkstepRendererAPI.dispatchEvent = (type: string, data?: unknown) => {
        iframeWin.parent.postMessage({ type, data }, '*');
      };

    if (!(iframeWin as unknown as Record<string, unknown>).TelemetryService) {
      (iframeWin as unknown as Record<string, unknown>).TelemetryService = {};
    }
    (iframeWin as unknown as Record<string, { interact?: unknown }>)
      .TelemetryService.interact = (type: string, _id: string, _sub: string, edata?: unknown) => {
        iframeWin.parent.postMessage({ type: 'content:interact', subtype: type || 'TOUCH', edata }, '*');
      };
  } catch { /* cross-origin */ }
}

/* ------------------------------------------------------------------ */
/* Multi-SCO navigation overlay                                          */
/*                                                                       */
/* Mirrors old player: left/right arrows floating on iframe sides,       */
/* vertically centered. No bottom bar — iframe gets full height.         */
/* Top strip shows module title + step dots (like PDF player).           */
/* ------------------------------------------------------------------ */

interface MultiScoNavProps {
  currentIndex: number;
  total: number;
  scoTitle: string;
  dir: 'ltr' | 'rtl';
  language: string;
  isTouch?: boolean;
  onPrev(): void;
  onNext(): void;
  onComplete(): void;
}

const ArrowBtn: React.FC<{
  direction: 'prev' | 'next';
  disabled?: boolean;
  isRtl?: boolean;
  isTouch?: boolean;
  language: string;
  onClick(): void;
}> = ({ direction, disabled, isRtl, isTouch, language, onClick }) => {
  const isLeftButton = direction === 'prev';
  const posKey = isRtl ? (isLeftButton ? 'right' : 'left') : (isLeftButton ? 'left' : 'right');
  const isHighlight = isRtl ? isLeftButton : !isLeftButton;

  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
      aria-label={direction === 'prev' ? t(language, 'PREV_MODULE') : t(language, 'NEXT_MODULE')}
      style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        [posKey]: 12,
        width: isTouch ? 48 : 42,
        height: isTouch ? 48 : 42,
        borderRadius: '50%',
        border: 'none',
        background: isHighlight ? 'var(--sp-brick, #a85236)' : 'white',
        color: isHighlight ? COLORS.white : 'var(--sp-ink, #376673)',
        boxShadow: isHighlight
          ? '0 4px 16px rgba(0,0,0,0.2)'
          : '0 2px 16px rgba(0,0,0,0.14)',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 21,
        transition: 'opacity 0.15s',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {direction === 'prev'
          ? <polyline points="15,18 9,12 15,6" />
          : <polyline points="9,18 15,12 9,6" />
        }
      </svg>
    </button>
  );
};

const MultiScoNav: React.FC<MultiScoNavProps> = ({
  currentIndex, total, scoTitle, dir, language, isTouch, onPrev, onNext, onComplete,
}) => {
  const isFirst = currentIndex === 0;
  const isLast  = currentIndex === total - 1;
  const isRtl = dir === 'rtl';
  const posKey = isRtl ? 'left' : 'right';
  const doneH = isTouch ? 48 : 40;

  return (
    <>
      {/* Left side button: LTR = prev, RTL = next (or complete if last) */}
      {isRtl && isLast ? (
        <button
          onClick={onComplete}
          aria-label={t(language, 'COMPLETE_COURSE')}
          style={{
            position: 'absolute',
            top: '50%',
            left: 8,
            transform: 'translateY(-50%)',
            height: doneH,
            padding: '0 14px',
            borderRadius: 20,
            border: 'none',
            background: COLORS.forest,
            color: COLORS.white,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            zIndex: 21,
            fontFamily: FONT_FAMILY,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20,6 9,17 4,12" />
          </svg>
          Done
        </button>
      ) : (
        <ArrowBtn
          direction={isRtl ? 'next' : 'prev'}
          disabled={isRtl ? false : isFirst}
          isRtl={isRtl}
          isTouch={isTouch}
          language={language}
          onClick={isRtl ? onNext : onPrev}
        />
      )}

      {/* Right side button: LTR = next (or complete if last), RTL = prev */}
      {!isRtl && isLast ? (
        <button
          onClick={onComplete}
          aria-label={t(language, 'COMPLETE_COURSE')}
          style={{
            position: 'absolute',
            top: '50%',
            right: 8,
            transform: 'translateY(-50%)',
            height: doneH,
            padding: '0 14px',
            borderRadius: 20,
            border: 'none',
            background: COLORS.forest,
            color: COLORS.white,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            zIndex: 21,
            fontFamily: FONT_FAMILY,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20,6 9,17 4,12" />
          </svg>
          Done
        </button>
      ) : (
        <ArrowBtn
          direction={isRtl ? 'prev' : 'next'}
          disabled={isRtl ? isFirst : false}
          isRtl={isRtl}
          isTouch={isTouch}
          language={language}
          onClick={isRtl ? onPrev : onNext}
        />
      )}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* HtmlPlugin                                                            */
/* ------------------------------------------------------------------ */

const HtmlPlugin = React.forwardRef<ContentPluginRef, ContentPluginProps>(
  ({ contentData, language, dir, menuBar, controlsLocation, onReady, onFinished, onError, onProgress, onInteract, onReplay, onExit }, ref) => {
    const isTouch            = useIsTouch();
    const iframeRef          = React.useRef<HTMLIFrameElement>(null);
    const initLayout = controlsLocation === 'top' ? 'A' : controlsLocation === 'bottom' ? 'D' : 'B';
    const [layout, setLayout] = React.useState<'A' | 'B' | 'D'>(initLayout);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const isScorm            = contentData.mimeType === 'application/vnd.ekstep.scorm-archive';

    /* SCO list — computed once from contentData */
    const scoList            = React.useMemo(() => buildScoList(contentData), [contentData]);
    const isMultiSco         = scoList.length > 1;
    const baseUrl            = React.useMemo(() =>
      getBaseUrl(contentData.artifactUrl, contentData.streamingUrl), [contentData]);

    /* Active SCO state */
    const [currentScoIndex, setCurrentScoIndex] = React.useState(0);
    const allScoStates       = React.useRef<Record<string, ScormState>>({});
    const currentScoIndexRef = React.useRef(0);
    const activeScoIdRef     = React.useRef(scoList[0]?.identifier ?? 'default');

    /* Keep refs in sync */
    React.useEffect(() => {
      currentScoIndexRef.current = currentScoIndex;
      activeScoIdRef.current = scoList[currentScoIndex]?.identifier ?? 'default';
    }, [currentScoIndex, scoList]);

    /* Blocks onFinished for 2s after replay() to prevent stale/immediate completions */
    const replayingRef   = React.useRef(false);

    /* Callbacks kept in refs to avoid stale closures */
    const onReadyRef     = React.useRef(onReady);
    const onFinishedRef  = React.useRef(onFinished);
    const onProgressRef  = React.useRef(onProgress);
    const onInteractRef  = React.useRef(onInteract);
    React.useEffect(() => { onReadyRef.current    = onReady;    }, [onReady]);
    React.useEffect(() => { onFinishedRef.current  = onFinished; }, [onFinished]);
    React.useEffect(() => { onProgressRef.current  = onProgress; }, [onProgress]);
    React.useEffect(() => { onInteractRef.current  = onInteract; }, [onInteract]);

    /* ---- Public ref API ---- */
    React.useImperativeHandle(ref, () => ({
      replay() {
        replayingRef.current = true;
        allScoStates.current = {};
        setCurrentScoIndex(0);
        if (iframeRef.current) {
          iframeRef.current.src = scoUrl(baseUrl, scoList[0]);
        }
        // Release block after 2s — enough time for iframe to initialize
        setTimeout(() => { replayingRef.current = false; }, 2000);
      },
      mute(muted: boolean) {
        try {
          const w = iframeRef.current?.contentWindow;
          if (!w) return;
          w.document.querySelectorAll('video, audio').forEach((el: unknown) => {
            (el as HTMLMediaElement).muted = muted;
          });
        } catch { /* cross-origin */ }
      },
      getProgress() {
        const id    = activeScoIdRef.current;
        const state = allScoStates.current[id] ?? {};
        const score = state['cmi.core.score.raw'];
        const loc   = state['cmi.core.lesson_location'];
        return {
          percent:     score ? parseFloat(score)  : undefined,
          currentTime: loc   ? parseFloat(loc)    : undefined,
        };
      },
    }));

    /* ---- Expose window.API on parent frame (SCORM 1.2) ---- */
    React.useEffect(() => {
      if (!isScorm) return;

      /* Initialize per-SCO state buckets */
      scoList.forEach(s => {
        if (!allScoStates.current[s.identifier]) {
          allScoStates.current[s.identifier] = {};
        }
      });

      const api = buildScormAPI({
        allScoStates,
        getActiveScoId:     () => activeScoIdRef.current,
        getScoList:         () => scoList,
        getCurrentScoIndex: () => currentScoIndexRef.current,
        onFinished:         () => onFinishedRef.current(),
        onInteract:         (sub, extra) => onInteractRef.current?.(sub, extra),
        onProgress:         (d) => onProgressRef.current?.(d),
        replayingRef,
      });

      (window as unknown as Record<string, unknown>).API = api;
      return () => { delete (window as unknown as Record<string, unknown>).API; };
    // Re-create API only when scoList changes (effectively once per content mount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isScorm, scoList.length]);

    /* ---- Expose compat interfaces on parent frame (for same-origin iframe access) ---- */
    React.useEffect(() => {
      const parentWin = window as any;
      const originalEkstep = parentWin.EkstepRendererAPI;
      const originalTelemetry = parentWin.TelemetryService;
      const originalOrg = parentWin.org;

      parentWin.EkstepRendererAPI = parentWin.EkstepRendererAPI || {
        dispatchEvent: (type: string, data?: any) => {
          window.postMessage({ type, data }, '*');
        },
        getContentMetadata: (contentId: string, cb: () => void) => {
          cb?.();
        },
        getGlobalConfig: () => ({})
      };

      parentWin.TelemetryService = parentWin.TelemetryService || {
        interact: (type: string, id: string, sub: string, edata?: any) => {
          window.postMessage({ type: 'content:interact', subtype: type || 'TOUCH', edata }, '*');
        },
        xapi: () => {},
        assess: () => {},
        assessEnd: () => {},
        navigate: () => {}
      };

      parentWin.org = parentWin.org || {};
      parentWin.org.ekstep = parentWin.org.ekstep || {};
      parentWin.org.ekstep.contentrenderer = parentWin.org.ekstep.contentrenderer || {};

      return () => {
        parentWin.EkstepRendererAPI = originalEkstep;
        parentWin.TelemetryService = originalTelemetry;
        parentWin.org = originalOrg;
      };
    }, []);

    /* ---- postMessage listener (content events + SCORM fallback) ---- */
    React.useEffect(() => {
      const handle = (event: MessageEvent) => {
        if (!event.data || typeof event.data !== 'object') return;
        const { type, subtype, eid, edata, key, value, callId } = event.data as Record<string, unknown>;

        /* SCORM postMessage fallback */
        const scormMethods = ['LMSInitialize','LMSGetValue','LMSSetValue','LMSCommit',
                              'LMSFinish','LMSGetLastError','LMSGetErrorString','LMSGetDiagnostic'];
        if (typeof type === 'string' && scormMethods.includes(type)) {
          const api = (window as unknown as Record<string, unknown>).API as Record<string, (...args: string[]) => string> | undefined;
          if (!api) return;
          let result: string;
          try {
            if (type === 'LMSSetValue') {
              result = api.LMSSetValue(String(key ?? ''), String(value ?? '')) ?? 'true';
            } else if (type === 'LMSGetValue') {
              result = api.LMSGetValue(String(key ?? '')) ?? '';
            } else if (type === 'LMSInitialize') {
              result = api.LMSInitialize(String(key ?? '')) ?? 'true';
            } else if (type === 'LMSFinish') {
              result = api.LMSFinish(String(key ?? '')) ?? 'true';
            } else if (type === 'LMSCommit') {
              result = api.LMSCommit(String(key ?? '')) ?? 'true';
            } else if (type === 'LMSGetLastError') {
              result = api.LMSGetLastError() ?? '0';
            } else if (type === 'LMSGetErrorString') {
              result = api.LMSGetErrorString(String(key ?? '')) ?? '';
            } else if (type === 'LMSGetDiagnostic') {
              result = api.LMSGetDiagnostic(String(key ?? '')) ?? '';
            } else {
              result = 'false';
            }
          }
          catch { result = 'false'; }
          (event.source as Window | null)?.postMessage({ callId, result }, { targetOrigin: '*' });
          return;
        }

        if (type === 'content:finished' || type === 'renderer:content:end') {
          onFinishedRef.current(); return;
        }
        if (type === 'content:error') {
          onError?.(String((event.data as Record<string, unknown>).message ?? 'Content error')); return;
        }
        if (type === 'content:interact' && subtype) {
          onInteractRef.current?.(String(subtype), (edata as Record<string, unknown>) ?? {}); return;
        }
        if (eid === 'OE_INTERACT' || eid === 'INTERACT') {
          const sub = (edata as Record<string, unknown>)?.subtype || event.data.subtype || 'TOUCH';
          onInteractRef.current?.(String(sub), (edata as Record<string, unknown>) ?? {}); return;
        }
        if (type === 'renderer:interact' || type === 'renderer:telemetry:interact') {
          const d = (event.data as Record<string, unknown>).data as Record<string, unknown>;
          onInteractRef.current?.(String(d?.subtype ?? 'TOUCH'), d ?? {}); return;
        }
      };
      window.addEventListener('message', handle);
      return () => window.removeEventListener('message', handle);
    }, [onError]);

    /* ---- Navigate to SCO by index ---- */
    const navigateToSco = React.useCallback((index: number) => {
      const sco = scoList[index];
      if (!sco) return;

      /* Init state bucket if needed */
      if (!allScoStates.current[sco.identifier]) {
        allScoStates.current[sco.identifier] = {};
      }

      setCurrentScoIndex(index);
      onInteractRef.current?.('SCORM_NAV', { scoId: sco.identifier, index });
      if (iframeRef.current) {
        iframeRef.current.src = scoUrl(baseUrl, sco);
      }
    }, [scoList, baseUrl]);

    /* ---- On iframe load: inject APIs + notify shell ---- */
    const handleLoad = React.useCallback(() => {
      const iframeWin = iframeRef.current?.contentWindow;
      if (iframeWin) {
        try {
          if (isScorm) {
            const api = (window as unknown as Record<string, unknown>).API;
            if (api) (iframeWin as unknown as Record<string, unknown>).API = api;
          }
          injectCompatShim(iframeWin);
        } catch { /* cross-origin */ }
      }
      onReadyRef.current();
    }, [isScorm]);

    const activeSco = scoList[currentScoIndex];
    const currentUrl = activeSco ? scoUrl(baseUrl, activeSco) : maybeSameOrigin(contentData.artifactUrl);

    const isRtl = dir === 'rtl';

    // Tap targets: ≥40px hit area on touch, original sizes on web.
    const barMenuSz = isTouch ? 44 : 30;
    const floatMenuSz = isTouch ? 44 : 34;
    const toolBtnStyle: React.CSSProperties = {
      width: isTouch ? 40 : 26, height: isTouch ? 40 : 26, border: 'none', background: 'none',
      borderRadius: '6px', cursor: 'pointer', color: '#666',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    };

    const PageNav = () => {
      const isFirst = currentScoIndex === 0;
      const isLast  = currentScoIndex === scoList.length - 1;

      return (
        <div style={{ display: 'flex', alignItems: 'center', background: '#f5f4f0', borderRadius: '8px', padding: '3px', gap: '1px' }}>
          <button
            onClick={isRtl ? (isLast ? () => onFinishedRef.current() : () => navigateToSco(currentScoIndex + 1)) : (isFirst ? undefined : () => navigateToSco(currentScoIndex - 1))}
            disabled={isRtl ? false : isFirst}
            style={(!isRtl && isFirst) ? { ...toolBtnStyle, opacity: 0.4, cursor: 'not-allowed' } : (isRtl ? { ...toolBtnStyle, background: 'var(--sp-brick, #a85236)', color: 'white', borderRadius: '6px' } : toolBtnStyle)}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {isRtl ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
            </svg>
          </button>
          <span style={{ fontSize: '11px', color: '#444', fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
            {currentScoIndex + 1}
          </span>
          <span style={{ fontSize: '11px', color: '#aaa', padding: '0 3px' }}>/ {scoList.length}</span>
          <button
            onClick={isRtl ? (isFirst ? undefined : () => navigateToSco(currentScoIndex - 1)) : (isLast ? () => onFinishedRef.current() : () => navigateToSco(currentScoIndex + 1))}
            disabled={isRtl ? isFirst : false}
            style={(isRtl && isFirst) ? { ...toolBtnStyle, opacity: 0.4, cursor: 'not-allowed' } : (isRtl ? toolBtnStyle : { ...toolBtnStyle, background: 'var(--sp-brick, #a85236)', color: 'white', borderRadius: '6px' })}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {isRtl ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
            </svg>
          </button>
        </div>
      );
    };

    const MenuBtn = ({ style }: { style?: React.CSSProperties }) => menuBar === false ? null : (
      <button
        onClick={() => setMenuOpen(o => !o)}
        style={{ width: `${barMenuSz}px`, height: `${barMenuSz}px`, border: 'none', background: 'none', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#aaa', flexShrink: 0, ...style }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="5" r="1.3" fill="currentColor"/>
          <circle cx="12" cy="12" r="1.3" fill="currentColor"/>
          <circle cx="12" cy="19" r="1.3" fill="currentColor"/>
        </svg>
      </button>
    );

    const progressPercent = scoList.length > 0 ? Math.round(((currentScoIndex + 1) / scoList.length) * 100) : 0;
    const dropTop = layout === 'D' ? 'auto' : '55px';
    const dropBottom = layout === 'D' ? '55px' : 'auto';

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}>
        {/* ── TOP BAR (layout A) ───────────────────────────────────────── */}
        {isMultiSco && layout === 'A' && (
          <>
            <div style={{ height: '50px', borderBottom: '1px solid #f2f1ed', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px', flexShrink: 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {activeSco?.title || contentData.name}
                </span>
              </div>
              <PageNav />
              <MenuBtn />
            </div>
            <div style={{ height: '3px', background: '#f2f1ed', flexShrink: 0 }}>
              <div style={{ height: '100%', background: 'var(--sp-brick, #a85236)', width: `${progressPercent}%`, transition: 'width 0.35s ease' }} />
            </div>
          </>
        )}

        <div style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          minHeight: 0,
        }}>
          <iframe
            ref={iframeRef}
            src={currentUrl}
            title={contentData.name}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock allow-downloads"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            onLoad={handleLoad}
            onError={() => onError?.('Failed to load content')}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#fff',
            }}
          />

          {/* ── FLOATING CONTROLS (layout B only) ───────────────────── */}
          {isMultiSco && layout === 'B' && (
            <>
              {/* Floating menu button */}
              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  style={{ width: `${floatMenuSz}px`, height: `${floatMenuSz}px`, border: 'none', background: 'white', borderRadius: '50%', boxShadow: '0 2px 10px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="5" r="1.3" fill="currentColor"/>
                    <circle cx="12" cy="12" r="1.3" fill="currentColor"/>
                    <circle cx="12" cy="19" r="1.3" fill="currentColor"/>
                  </svg>
                </button>
              </div>

              {/* Multi-SCO navigation side arrows */}
              <MultiScoNav
                currentIndex={currentScoIndex}
                total={scoList.length}
                scoTitle={activeSco?.title ?? activeSco?.identifier ?? ''}
                dir={dir}
                language={language}
                isTouch={isTouch}
                onPrev={() => navigateToSco(currentScoIndex - 1)}
                onNext={() => navigateToSco(currentScoIndex + 1)}
                onComplete={() => onFinishedRef.current()}
              />
            </>
          )}
        </div>

        {/* ── BOTTOM BAR (layout D) ────────────────────────────────────── */}
        {isMultiSco && layout === 'D' && (
          <div style={{ height: '50px', borderTop: '1px solid #f2f1ed', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                {activeSco?.title || contentData.name}
              </span>
            </div>
            <PageNav />
            <MenuBtn />
          </div>
        )}

        {/* ── Menu dropdown (multi-SCO only) ───────────────────────── */}
        {isMultiSco && menuBar !== false && menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 28 }} />
            <div style={{
              position: 'absolute',
              top: dropTop, bottom: dropBottom, right: '12px',
              width: '240px', background: 'white', borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.16)', border: '1px solid #f0efe5',
              overflow: 'hidden', zIndex: 29, display: 'flex', flexDirection: 'column',
              fontFamily: 'Rubik, sans-serif', animation: 'drop-in 0.2s ease-out',
            }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #f5f4ee', fontSize: '11px', color: '#aaa', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {contentData.name || 'SCORM'}
              </div>

              {/* Replay */}
              <button
                onClick={() => { setMenuOpen(false); onReplay?.(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #f5f4ee', textAlign: 'left', fontFamily: 'inherit', fontSize: '13px', color: '#333' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.26"/></svg>
                &nbsp;Replay
              </button>

              {/* Exit */}
              <button
                onClick={() => { setMenuOpen(false); onExit?.(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: '13px', color: 'var(--sp-brick, #a85236)', fontWeight: 600 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sp-brick, #a85236)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                &nbsp;Exit
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
);

HtmlPlugin.displayName = 'HtmlPlugin';

export const HTML_PLUGIN_DEFINITION = {
  mimeTypes: [
    'application/vnd.ekstep.html-archive',
    'application/vnd.ekstep.h5p-archive',
    'application/vnd.ekstep.scorm-archive',
  ],
  component: HtmlPlugin,
};

export default HtmlPlugin;
