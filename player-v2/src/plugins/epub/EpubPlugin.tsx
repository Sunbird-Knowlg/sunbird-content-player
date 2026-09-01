import React from 'react';
import type { ContentPluginProps, ContentPluginRef } from '../plugin.interface';
import { useIsTouch } from '../../hooks/useIsTouch';
import { t } from '../../i18n/i18n';

declare global {
  interface Window {
    ePub: any;
  }
}

const MAX_SPINE_LOAD_MS = 30 * 1000;

const EpubPlugin = React.forwardRef<ContentPluginRef, ContentPluginProps>(
  ({ contentData, language, dir, assets, menuBar, controlsLocation, downloadContent, onReady, onFinished, onProgress, onInteract, onReplay, onExit }, ref) => {
    const isTouch = useIsTouch();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const ebookRef = React.useRef<any>(null);
    const renditionRef = React.useRef<any>(null);

    const [epubjsLoaded, setEpubjsLoaded] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(0);
    // Layout driven by controlsLocation config; 'A'=top bar, 'B'=floating default, 'D'=bottom bar
    const initLayout = controlsLocation === 'top' ? 'A' : controlsLocation === 'bottom' ? 'D' : 'B';
    const [layout, setLayout] = React.useState<'A' | 'B' | 'D'>(initLayout);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const finishedRef = React.useRef(false);
    const readyFiredRef = React.useRef(false);
    /*
     * Auto-finish (location.atEnd) must NOT fire on the initial display. A
     * single-page EPUB (and some multi-page books) report atEnd === true on the
     * first relocate, which jumped straight to the end screen. Only treat
     * atEnd as completion once the user has actually navigated forward.
     */
    const navigatedRef = React.useRef(false);

    const onReadyRef = React.useRef(onReady);
    const onFinishedRef = React.useRef(onFinished);
    const onProgressRef = React.useRef(onProgress);

    React.useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
    React.useEffect(() => { onFinishedRef.current = onFinished; }, [onFinished]);
    React.useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

    // Load JSZip + epub.js — from local asset paths when provided (offline), else CDN.
    React.useEffect(() => {
      if (window.ePub) {
        setEpubjsLoaded(true);
        return;
      }

      const loadScript = (src: string): Promise<void> =>
        new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = src;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error(`Failed to load ${src}`));
          document.head.appendChild(s);
        });

      const jszipSrc = assets?.jszipScript
        ?? 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
      const epubjsSrc = assets?.epubjsScript
        ?? 'https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js';

      // JSZip must load first — epubjs checks window.JSZip at init time
      loadScript(jszipSrc)
        .then(() => loadScript(epubjsSrc))
        .then(() => setEpubjsLoaded(true))
        .catch((e) => {
          console.error('[EpubPlugin] Failed to load EPUB libraries:', e);
          setError('Failed to load EPUB viewer library');
        });
    }, []);

    // For locally downloaded content, resolver sets artifactUrl to the basename
    // and basePath to the Capacitor webview directory URL. Reconstruct the full URL.
    const epubUrl = contentData.isAvailableLocally && contentData.basePath && contentData.artifactUrl
      ? `${contentData.basePath.replace(/\/$/, '')}/${contentData.artifactUrl}`
      : (contentData.streamingUrl || contentData.artifactUrl || '');

    /* Download is shown unless the portal explicitly disables it (downloadContent === false). */
    const showDownload = downloadContent !== false;

    /* Fetch the EPUB as a blob and save it via an object-URL anchor (reliable for
       cross-origin URLs). Falls back to opening the URL in a new tab on failure. */
    const handleDownload = async () => {
      if (!epubUrl) return;
      onInteract?.('DOWNLOAD', { url: epubUrl });
      const base = (contentData.name || 'document').replace(/[\\/:*?"<>|]+/g, '_').trim();
      const fileName = base.toLowerCase().endsWith('.epub') ? base : `${base}.epub`;
      try {
        const res = await fetch(epubUrl);
        const blob = await res.blob();
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(objUrl);
      } catch {
        window.open(epubUrl, '_blank', 'noopener');
      }
    };

    // Init epub rendition after library + container are ready
    React.useEffect(() => {
      if (!epubjsLoaded || !containerRef.current || !epubUrl) {
        return;
      }

      let cancelled = false;
      finishedRef.current = false;
      readyFiredRef.current = false;
      navigatedRef.current = false;
      setLoading(true);
      setError(null);

      const containerEl = containerRef.current;
      const initW = containerEl.clientWidth  || 800;
      const initH = containerEl.clientHeight || 600;

      /*
       * Fetch EPUB as a Blob first, then pass the Blob to epubjs.
       * This mirrors the old sunbird-epub-player approach:
       *   ViwerService.isValidEpubSrc(src) → http.get(src, { responseType: 'blob' })
       *   Epub(blob)
       */
      fetch(epubUrl)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch EPUB: ${res.status} ${res.statusText}`);
          return res.blob();
        })
        .then(blob => {
          if (cancelled) {
            return;
          }
          if (blob.size === 0) {
            throw new Error('EPUB file is empty (0 bytes)');
          }

          const ebook = window.ePub(blob);
          ebookRef.current = ebook;

          const rendition = ebook.renderTo(containerEl, {
            flow: 'paginated',
            width: initW,
            height: initH,
            spread: 'none',
          });
          renditionRef.current = rendition;

          // Switch layout based on navigation / TOC depth
          rendition.on('layout', () => {
            const tocLen = ebook.navigation?.toc?.length ?? 0;
            if (tocLen > 2) {
              rendition.spread('none');
              rendition.flow('scrolled');
            } else {
              rendition.spread('auto');
            }
          });

          // Track location and fire progress/finish
          rendition.on('relocated', (location: any) => {
            const spineLen = ebook.spine?.length ?? 1;
            const idx = location?.start?.index ?? 0;
            const currentPage = idx + 1;
            setPage(currentPage);

            onProgressRef.current?.({
              currentTime: currentPage,
              duration: spineLen,
              percent: Math.round((currentPage / spineLen) * 100),
            });

            if (location.atEnd && navigatedRef.current && readyFiredRef.current && !finishedRef.current) {
              finishedRef.current = true;
              onFinishedRef.current();
            }
          });

          // Listen for any errors from rendition
          rendition.on('displayError', (err: any) => {
            console.error('[EpubPlugin] rendition displayError:', err);
          });

          // Wait for spine, then fire-and-forget display (mirrors sunbird-epub-player)
          const spinePromise = ebook.loaded?.spine ?? ebook.spine?.ready ?? new Promise<null>((r) => setTimeout(() => r(null), 5000));
          const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), MAX_SPINE_LOAD_MS)
          );

          Promise.race([spinePromise, timeoutPromise]).then((spine: any) => {
            if (cancelled) {
              return;
            }

            if (!spine) {
              console.error('[EpubPlugin] Spine load timed out after', MAX_SPINE_LOAD_MS, 'ms');
              setError('EPUB took too long to load');
              setLoading(false);
              return;
            }

            const spineLen = spine.length ?? 1;
            setTotalPages(spineLen > 0 ? spineLen : 1);

            rendition.display();
            setLoading(false);
            readyFiredRef.current = true;
            onReadyRef.current();

            ebook.ready.then(() => {
              return ebook.locations.generate(1000);
            }).then(() => {
            }).catch((e: any) => {
              console.warn('[EpubPlugin] Location generation failed (non-fatal):', e);
            });
          }).catch((err: any) => {
            console.error('[EpubPlugin] Spine load promise rejected:', err);
            if (!cancelled) {
              setError('Failed to load EPUB content');
              setLoading(false);
            }
          });
        })
        .catch(err => {
          console.error('[EpubPlugin] Fetch/blob error:', err);
          if (!cancelled) {
            setError(err?.message || 'Failed to fetch EPUB file');
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
        try { renditionRef.current?.destroy(); } catch { /* ignore */ }
        try { ebookRef.current?.destroy(); } catch { /* ignore */ }
        renditionRef.current = null;
        ebookRef.current = null;
      };
    }, [epubjsLoaded, epubUrl]);

    // Resize rendition when container gains real dimensions (display:none → visible)
    React.useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const obs = new ResizeObserver(() => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (w > 0 && h > 0 && renditionRef.current) {
          renditionRef.current.resize(w, h);
        }
      });
      obs.observe(el);
      return () => obs.disconnect();
    }, []);

    React.useImperativeHandle(ref, () => ({
      replay() {
        finishedRef.current = false;
        readyFiredRef.current = true;
        navigatedRef.current = false;
        setPage(1);
        // display() with no arg returns to book start; display(0) is unreliable as a spine index
        renditionRef.current?.display();
        onReadyRef.current();
        onInteract?.('REPLAY');
      },
      mute() {},
      getProgress() {
        return {
          currentTime: page,
          duration: totalPages,
          percent: totalPages > 0 ? Math.round((page / totalPages) * 100) : 0,
        };
      },
    }));

    const handleNext = () => {
      if (page < totalPages) {
        navigatedRef.current = true; // real forward navigation — enables atEnd auto-finish
        renditionRef.current?.next();
        onInteract?.('NEXT', { page: page + 1 });
      } else if (!finishedRef.current) {
        finishedRef.current = true;
        onFinishedRef.current();
      }
    };

    const handlePrev = () => {
      if (page > 1) {
        renditionRef.current?.prev();
        onInteract?.('PREVIOUS', { page: page - 1 });
      }
    };

    const isRtl = dir === 'rtl';

    // Tap targets: ≥40px hit area on touch, original sizes on web.
    const numW = isTouch ? 44 : 30;
    const numH = isTouch ? 38 : 24;
    const arrowSize = isTouch ? 48 : 42;
    const floatMenuSz = isTouch ? 44 : 34;
    const barMenuSz = isTouch ? 44 : 30;

    const toolBtnStyle: React.CSSProperties = {
      width: isTouch ? 40 : 26, height: isTouch ? 40 : 26, border: 'none', background: 'none',
      borderRadius: '6px', cursor: 'pointer', color: '#666',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    };

    const handlePageInput = (v: number) => {
      if (v >= 1 && v <= totalPages) {
        setPage(v);
        const spine = ebookRef.current?.spine;
        if (spine) {
          const item = spine.at ? spine.at(v - 1) : spine[v - 1];
          if (item) {
            renditionRef.current?.display(item.cfi || (v - 1));
          } else {
            renditionRef.current?.display(v - 1);
          }
        } else {
          renditionRef.current?.display(v - 1);
        }
        onInteract?.('PAGE_CHANGE', { page: v });
      }
    };

    const PageNav = () => (
      <div style={{ display: 'flex', alignItems: 'center', background: '#f5f4f0', borderRadius: '8px', padding: '3px', gap: '1px' }}>
        <button onClick={isRtl ? handleNext : handlePrev} style={toolBtnStyle}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {isRtl ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
          </svg>
        </button>
        <input
          type="number" value={page} min={1} max={totalPages || 1}
          onChange={e => handlePageInput(parseInt(e.target.value))}
          style={{ width: `${numW}px`, height: `${numH}px`, border: 'none', background: 'white', borderRadius: '5px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#333', outline: 'none', padding: 0 }}
        />
        <span style={{ fontSize: '11px', color: '#aaa', padding: '0 3px' }}>/ {totalPages || '—'}</span>
        <button onClick={isRtl ? handlePrev : handleNext} style={{ ...toolBtnStyle, background: 'var(--sp-brick, #a85236)', color: 'white', borderRadius: '6px' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {isRtl ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
          </svg>
        </button>
      </div>
    );

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

    const progressPercent = totalPages > 0 ? Math.round((page / totalPages) * 100) : 0;
    const dropTop = layout === 'D' ? 'auto' : '55px';
    const dropBottom = layout === 'D' ? '55px' : 'auto';

    if (error) {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f4ee', fontFamily: 'Rubik, sans-serif', flexDirection: 'column', gap: '12px', color: '#666', fontSize: '14px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--sp-brick, #a85236)" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      );
    }

    return (
      <div style={{
        width: '100%', height: '100%', background: 'white',
        display: 'flex', flexDirection: 'column',
        position: 'relative', fontFamily: 'Rubik, sans-serif',
      }}>

        {/* ── TOP BAR (layout A) ───────────────────────────────────────── */}
        {layout === 'A' && (
          <>
            <div style={{ height: '50px', borderBottom: '1px solid #f2f1ed', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px', flexShrink: 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                  {contentData.name || t(language, 'EPUB_DOCUMENT')}
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

        {/* ── CONTENT WRAPPER ─────────────────────────────────────────── */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {/* EPUB render target — always visible so epubjs has non-zero dimensions */}
          <div
            ref={containerRef}
            style={{
              position: 'absolute', inset: 0,
              overflow: 'hidden',
              background: 'white',
            }}
          />

          {/* Loading overlay — on top of container, does NOT hide it */}
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, background: 'white', zIndex: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#888', fontSize: '14px',
            }}>
              {t(language, 'LOADING_EPUB')}
            </div>
          )}

          {/* ── FLOATING CONTROLS (layout B only) ───────────────────── */}
          {layout === 'B' && !loading && (
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

              {/* Left nav arrow */}
              <button
                onClick={isRtl ? handleNext : handlePrev}
                style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: arrowSize, height: arrowSize, border: 'none',
                  background: isRtl ? 'var(--sp-brick, #a85236)' : 'white',
                  borderRadius: '50%',
                  boxShadow: isRtl ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 16px rgba(0,0,0,0.14)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isRtl ? 'white' : 'var(--sp-ink, #376673)', zIndex: 10
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>

              {/* Right nav arrow */}
              <button
                onClick={isRtl ? handlePrev : handleNext}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: arrowSize, height: arrowSize, border: 'none',
                  background: isRtl ? 'white' : 'var(--sp-brick, #a85236)',
                  borderRadius: '50%',
                  boxShadow: isRtl ? '0 2px 16px rgba(0,0,0,0.14)' : '0 4px 16px rgba(0,0,0,0.2)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isRtl ? 'var(--sp-ink, #376673)' : 'white', zIndex: 10
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              {/* Floating bottom toolbar */}
              <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.14)', display: 'flex', alignItems: 'center', padding: '0 12px', zIndex: 10, height: isTouch ? 52 : 36, whiteSpace: 'nowrap', gap: '6px' }}>
                <input
                  type="number" value={page} min={1} max={totalPages || 1}
                  onChange={e => handlePageInput(parseInt(e.target.value))}
                  style={{ width: `${numW}px`, height: `${isTouch ? 38 : 26}px`, border: '1px solid #e8e7e2', borderRadius: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#333', outline: 'none', padding: 0 }}
                />
                <span style={{ fontSize: '11px', color: '#aaa' }}>/ {totalPages || '—'}</span>
              </div>
            </>
          )}
        </div>

        {/* ── BOTTOM BAR (layout D) ────────────────────────────────────── */}
        {layout === 'D' && (
          <div style={{ height: '50px', borderTop: '1px solid #f2f1ed', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                {contentData.name || t(language, 'EPUB_DOCUMENT')}
              </span>
            </div>
            <PageNav />
            <MenuBtn />
          </div>
        )}

        {/* ── Menu dropdown ────────────────────────────────────────── */}
        {menuOpen && (
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
                {contentData.name || t(language, 'EPUB_DOCUMENT')}
              </div>

              {/* Replay */}
              <button
                onClick={() => { setMenuOpen(false); onReplay?.(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #f5f4ee', textAlign: 'left', fontFamily: 'inherit', fontSize: '13px', color: '#333' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.26"/></svg>
                {t(language, 'REPLAY')}
              </button>

              {/* Download — hidden when portal sets downloadContent: false */}
              {showDownload && (
                <button
                  onClick={() => { setMenuOpen(false); handleDownload(); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #f5f4ee', textAlign: 'left', fontFamily: 'inherit', fontSize: '13px', color: '#333' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  {t(language, 'DOWNLOAD')}
                </button>
              )}

              {/* Exit */}
              <button
                onClick={() => { setMenuOpen(false); onExit?.(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: '13px', color: 'var(--sp-brick, #a85236)', fontWeight: 600 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sp-brick, #a85236)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                {t(language, 'EXIT')}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
);

const floatToolBtnStyle: React.CSSProperties = {
  width: '26px', height: '26px', border: '1px solid #e8e7e2', background: 'white',
  borderRadius: '6px', cursor: 'pointer', color: '#555',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

EpubPlugin.displayName = 'EpubPlugin';

export const EPUB_PLUGIN_DEFINITION = {
  mimeTypes: ['application/epub', 'application/epub+zip'],
  component: EpubPlugin,
};

export default EpubPlugin;
