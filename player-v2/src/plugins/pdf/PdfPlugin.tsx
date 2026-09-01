import React from 'react';
import type { ContentPluginProps, ContentPluginRef } from '../plugin.interface';
import { useIsTouch } from '../../hooks/useIsTouch';
import { t } from '../../i18n/i18n';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

const PdfPlugin = React.forwardRef<ContentPluginRef, ContentPluginProps>(
  ({ contentData, language, dir, assets, menuBar, controlsLocation, downloadContent, onReady, onFinished, onProgress, onInteract, onReplay, onExit }, ref) => {
    const isTouch = useIsTouch();
    const [pdfjsLoaded, setPdfjsLoaded] = React.useState(false);
    const [pdfDoc, setPdfDoc] = React.useState<any>(null);
    const [page, setPage] = React.useState(1);
    const [zoom, setZoom] = React.useState(100);
    // Layout driven by controlsLocation config; 'A'=top bar, 'B'=floating default, 'D'=bottom bar
    const initLayout = controlsLocation === 'top' ? 'A' : controlsLocation === 'bottom' ? 'D' : 'B';
    const [layout, setLayout] = React.useState<'A' | 'B' | 'D'>(initLayout);
    const [rotation, setRotation] = React.useState(0);
    const [pdfMenuOpen, setPdfMenuOpen] = React.useState(false);
    const [totalPages, setTotalPages] = React.useState(0);
    const [loading, setLoading] = React.useState(true);

    const pageRefs = React.useRef<(HTMLCanvasElement | null)[]>([]);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const finishedRef = React.useRef(false);
    const readyFiredRef = React.useRef(false);

    /* Touch-only windowed rendering: pages currently holding a drawn bitmap. */
    const drawnRef = React.useRef<Set<number>>(new Set());

    const onReadyRef = React.useRef(onReady);
    const onFinishedRef = React.useRef(onFinished);
    const onProgressRef = React.useRef(onProgress);
    const onInteractRef = React.useRef(onInteract);
    const lastImpressionPageRef = React.useRef(0);

    React.useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
    React.useEffect(() => { onFinishedRef.current = onFinished; }, [onFinished]);
    React.useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);
    React.useEffect(() => { onInteractRef.current = onInteract; }, [onInteract]);

    // Tap targets: ≥40px hit area on touch, original sizes on web.
    const arrowSize   = isTouch ? 48 : 42; // floating side nav arrows (layout B)
    const floatMenuSz = isTouch ? 44 : 34; // floating round menu button (layout B)
    const barMenuSz   = isTouch ? 44 : 30; // menu button inside top/bottom bars
    const numW        = isTouch ? 44 : 30; // page-number input width
    const numH        = isTouch ? 38 : 24; // page-number input height

    const toolBtnStyle: React.CSSProperties = {
      width: isTouch ? 40 : 26, height: isTouch ? 40 : 26, border: 'none', background: 'none',
      borderRadius: '6px', cursor: 'pointer', color: '#666',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    };

    const floatToolBtnStyle: React.CSSProperties = {
      width: isTouch ? 40 : 26, height: isTouch ? 40 : 26, border: '1px solid #e8e7e2', background: 'white',
      borderRadius: '6px', cursor: 'pointer', color: '#555',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    };

    // Load PDF.js — from local asset path when provided (offline), else CDN.
    React.useEffect(() => {
      if (window.pdfjsLib) { setPdfjsLoaded(true); return; }
      const scriptSrc = assets?.pdfjsScript
        ?? 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      const workerSrc = assets?.pdfjsWorker
        ?? 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        setPdfjsLoaded(true);
      };
      document.head.appendChild(script);
    }, []);

    // For locally downloaded content, resolver sets artifactUrl to the basename
    // and basePath to the Capacitor webview directory URL. Reconstruct the full URL.
    const pdfUrl = contentData.isAvailableLocally && contentData.basePath && contentData.artifactUrl
      ? `${contentData.basePath.replace(/\/$/, '')}/${contentData.artifactUrl}`
      : (contentData.streamingUrl || contentData.artifactUrl || '');

    /* Download is shown unless the portal explicitly disables it (downloadContent === false). */
    const showDownload = downloadContent !== false;

    /* Fetch the PDF as a blob and save it via an object-URL anchor (reliable for
       cross-origin URLs, unlike the bare `download` attribute). Falls back to
       opening the URL in a new tab if the fetch fails. */
    const handleDownload = async () => {
      if (!pdfUrl) return;
      onInteract?.('DOWNLOAD', { url: pdfUrl });
      const base = (contentData.name || 'document').replace(/[\\/:*?"<>|]+/g, '_').trim();
      const fileName = base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
      try {
        const res = await fetch(pdfUrl);
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
        window.open(pdfUrl, '_blank', 'noopener');
      }
    };

    React.useEffect(() => {
      if (!pdfjsLoaded || !pdfUrl) return;
      setLoading(true);
      finishedRef.current = false;
      readyFiredRef.current = false;
      drawnRef.current.clear();
      window.pdfjsLib.getDocument(pdfUrl).promise.then((pdf: any) => {
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setPage(1);
        setLoading(false);
        readyFiredRef.current = true;
        onReadyRef.current();
      }).catch(() => setLoading(false));
    }, [pdfjsLoaded, pdfUrl]);

    /* ── WEB: render ALL pages whenever doc/zoom/rotation changes. ──────────
       The canvas elements are ALWAYS mounted (layout switch never remounts). */
    React.useEffect(() => {
      if (!pdfDoc || !totalPages || isTouch) return;
      const renderAll = async () => {
        for (let i = 1; i <= totalPages; i++) {
          const pdfPage = await pdfDoc.getPage(i);
          const canvas = pageRefs.current[i - 1];
          if (!canvas) continue;
          const viewport = pdfPage.getViewport({ scale: zoom / 100, rotation });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const ctx = canvas.getContext('2d');
          if (ctx) pdfPage.render({ canvasContext: ctx, viewport });
        }
      };
      renderAll();
    }, [pdfDoc, totalPages, zoom, rotation, isTouch]);

    /* ── TOUCH: windowed rendering to avoid OOM on large PDFs. ──────────────
       Render only pages near the current one; far pages are blanked (bitmap
       freed) but keep their layout size so scrolling/offsetTop stays correct. */
    const drawWindow = React.useCallback(async () => {
      if (!pdfDoc || !totalPages || !isTouch) return;
      const WINDOW = 2; // draw current ±2
      const KEEP = 4;   // evict beyond current ±4
      const lo = Math.max(1, page - WINDOW);
      const hi = Math.min(totalPages, page + WINDOW);

      // Evict far pages → blank canvas (frees bitmap, keeps layout size).
      for (const dp of Array.from(drawnRef.current)) {
        if (dp < page - KEEP || dp > page + KEEP) {
          const canvas = pageRefs.current[dp - 1];
          if (canvas) {
            const pdfPage = await pdfDoc.getPage(dp);
            const viewport = pdfPage.getViewport({ scale: zoom / 100, rotation });
            canvas.width = viewport.width; // assigning width also clears the bitmap
            canvas.height = viewport.height;
          }
          drawnRef.current.delete(dp);
        }
      }

      // Draw window pages that are not already drawn.
      for (let i = lo; i <= hi; i++) {
        if (drawnRef.current.has(i)) continue;
        const canvas = pageRefs.current[i - 1];
        if (!canvas) continue;
        const pdfPage = await pdfDoc.getPage(i);
        const viewport = pdfPage.getViewport({ scale: zoom / 100, rotation });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await pdfPage.render({ canvasContext: ctx, viewport }).promise;
          drawnRef.current.add(i);
        }
      }
    }, [pdfDoc, totalPages, isTouch, page, zoom, rotation]);

    // TOUCH: reserve correct blank size for every page on doc/zoom/rotation change,
    // then (re)draw the current window.
    React.useEffect(() => {
      if (!pdfDoc || !totalPages || !isTouch) return;
      let cancelled = false;
      const reserve = async () => {
        for (let i = 1; i <= totalPages; i++) {
          if (cancelled) return;
          const pdfPage = await pdfDoc.getPage(i);
          const canvas = pageRefs.current[i - 1];
          if (!canvas) continue;
          const viewport = pdfPage.getViewport({ scale: zoom / 100, rotation });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
        }
        drawnRef.current.clear();
        if (!cancelled) drawWindow();
      };
      reserve();
      return () => { cancelled = true; };
      // drawWindow intentionally omitted — reserve resets the window on zoom/rotation.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfDoc, totalPages, zoom, rotation, isTouch]);

    // TOUCH: redraw window as the visible page changes (scroll / nav).
    React.useEffect(() => {
      if (isTouch) drawWindow();
    }, [page, isTouch, drawWindow]);

    React.useEffect(() => {
      if (totalPages <= 0) return;
      onProgressRef.current?.({
        currentTime: page,
        duration: totalPages,
        percent: Math.round((page / totalPages) * 100),
      });
      /* Per-page view → IMPRESSION (shell routes PAGE_CHANGE to impression).
         Mirrors reference PDF/EPUB players. Skip the initial page-1 mount. */
      if (page !== lastImpressionPageRef.current && lastImpressionPageRef.current !== 0) {
        onInteractRef.current?.('PAGE_CHANGE', { page });
      }
      lastImpressionPageRef.current = page;
    }, [page, totalPages]);

    React.useImperativeHandle(ref, () => ({
      replay() {
        finishedRef.current = false;
        readyFiredRef.current = true;
        setPage(1);
        if (containerRef.current) containerRef.current.scrollTop = 0;
        onReadyRef.current();
        // PlayingScreen may be display:none — re-apply scroll after React makes it visible
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (containerRef.current) containerRef.current.scrollTop = 0;
          });
        });
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

    const scrollToPage = (p: number) => {
      const container = containerRef.current;
      const canvas = pageRefs.current[p - 1];
      if (!container || !canvas) return;
      /* Scroll ONLY the player's own scroll container — NOT via
         element.scrollIntoView(), which walks up and scrolls every scrollable
         ancestor too (the outer collection/content page jumped on first Next). */
      const delta = canvas.getBoundingClientRect().top - container.getBoundingClientRect().top;
      container.scrollTo({ top: container.scrollTop + delta, behavior: 'smooth' });
    };

    const handleNext = () => {
      if (page < totalPages) {
        scrollToPage(page + 1);
        onInteract?.('NEXT', { page: page + 1 });
      } else if (!finishedRef.current) {
        finishedRef.current = true;
        onFinishedRef.current();
      }
    };

    const handlePrev = () => {
      if (page > 1) {
        scrollToPage(page - 1);
        onInteract?.('PREVIOUS', { page: page - 1 });
      }
    };

    const handleZoomIn = () => {
      const levels = [75, 100, 125, 150];
      const idx = levels.indexOf(zoom);
      if (idx < levels.length - 1) {
        setZoom(levels[idx + 1]);
        onInteract?.('ZOOM_IN', { zoom: levels[idx + 1] });
      }
    };

    const handleZoomOut = () => {
      const levels = [75, 100, 125, 150];
      const idx = levels.indexOf(zoom);
      if (idx > 0) {
        setZoom(levels[idx - 1]);
        onInteract?.('ZOOM_OUT', { zoom: levels[idx - 1] });
      }
    };

    const handleRotateRight = () => {
      const next = (rotation + 90) % 360;
      setRotation(next);
      onInteract?.('ROTATION_CHANGE', { rotation: next });
    };

    const handleRotateLeft = () => {
      const next = (rotation - 90 + 360) % 360;
      setRotation(next);
      onInteract?.('ROTATION_CHANGE', { rotation: next });
    };

    const handlePageInput = (v: number) => {
      if (v >= 1 && v <= totalPages) {
        setPage(v);
        scrollToPage(v);
        onInteractRef.current?.('NAVIGATE_TO_PAGE', { page: v });
      }
    };

    /* ── TOUCH: pinch-to-zoom (discrete, snaps to existing zoom levels). ──────
       Multi-touch never fires on a mouse device, so the web path is untouched. */
    const pinchDistRef = React.useRef<number | null>(null);
    const touchDist = (t: React.TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 2) pinchDistRef.current = touchDist(e.touches);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
      if (e.touches.length !== 2 || pinchDistRef.current == null) return;
      const d = touchDist(e.touches);
      const ratio = d / pinchDistRef.current;
      if (ratio > 1.2) { handleZoomIn(); pinchDistRef.current = d; }
      else if (ratio < 0.83) { handleZoomOut(); pinchDistRef.current = d; }
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
      if (e.touches.length < 2) pinchDistRef.current = null;
    };

    const progressPercent = totalPages > 0 ? Math.round((page / totalPages) * 100) : 0;

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const scrollMid = container.scrollTop + container.clientHeight / 2;
      let currentPage = 1;
      for (let i = 0; i < pageRefs.current.length; i++) {
        const canvas = pageRefs.current[i];
        if (canvas && canvas.offsetTop <= scrollMid) currentPage = i + 1;
      }
      setPage(currentPage);
      const isAtBottom = Math.ceil(container.clientHeight + container.scrollTop) >= container.scrollHeight - 5;
      if (isAtBottom && currentPage === totalPages && readyFiredRef.current && !finishedRef.current) {
        finishedRef.current = true;
        onFinishedRef.current();
      }
    };

    // ── Shared toolbar controls (used in both top and bottom bars) ──────────
    const ZoomControls = () => (
      <div style={{ display: 'flex', alignItems: 'center', background: '#f5f4f0', borderRadius: '8px', padding: '3px', gap: '1px' }}>
        <button onClick={handleZoomOut} onMouseDown={noScroll} style={toolBtnStyle}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <span style={{ fontSize: '11px', color: '#444', fontWeight: 600, minWidth: '36px', textAlign: 'center' }}>{zoom}%</span>
        <button onClick={handleZoomIn} onMouseDown={noScroll} style={toolBtnStyle}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    );

    const PageNav = () => {
      const isRtl = dir === 'rtl';
      return (
        <div style={{ display: 'flex', alignItems: 'center', background: '#f5f4f0', borderRadius: '8px', padding: '3px', gap: '1px' }}>
          <button
            onClick={isRtl ? handleNext : handlePrev}
            onMouseDown={noScroll}
            style={isRtl ? { ...toolBtnStyle, background: 'var(--sp-brick)', color: 'white', borderRadius: '6px' } : toolBtnStyle}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <input
            type="number" value={page} min={1} max={totalPages || 1}
            onChange={e => handlePageInput(parseInt(e.target.value))}
            style={{ width: `${numW}px`, height: `${numH}px`, border: 'none', background: 'white', borderRadius: '5px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#333', outline: 'none', padding: 0 }}
          />
          <span style={{ fontSize: '11px', color: '#aaa', padding: '0 3px' }}>/ {totalPages || 1}</span>
          <button
            onClick={isRtl ? handlePrev : handleNext}
            onMouseDown={noScroll}
            style={isRtl ? toolBtnStyle : { ...toolBtnStyle, background: 'var(--sp-brick)', color: 'white', borderRadius: '6px' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      );
    };

    const MenuBtn = ({ style }: { style?: React.CSSProperties }) => menuBar === false ? null : (
      <button
        onClick={() => setPdfMenuOpen(o => !o)}
        style={{ width: `${barMenuSz}px`, height: `${barMenuSz}px`, border: 'none', background: 'none', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#aaa', flexShrink: 0, ...style }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="5" r="1.3" fill="currentColor"/>
          <circle cx="12" cy="12" r="1.3" fill="currentColor"/>
          <circle cx="12" cy="19" r="1.3" fill="currentColor"/>
        </svg>
      </button>
    );

    const renderMenuDropdown = () => {
      if (!pdfMenuOpen) return null;

      // Position dropdown: under menu btn for top-bar layouts, above for bottom layout
      const dropTop = layout === 'D' ? 'auto' : '55px';
      const dropBottom = layout === 'D' ? '55px' : 'auto';

      return (
        <>
          <div onClick={() => setPdfMenuOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 28 }} />
          <div style={{
            position: 'absolute',
            top: dropTop, bottom: dropBottom, right: '12px',
            width: '240px', background: 'white', borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.16)', border: '1px solid #f0efe5',
            overflow: 'hidden', zIndex: 29, display: 'flex', flexDirection: 'column',
            fontFamily: 'Rubik, sans-serif', animation: 'drop-in 0.2s ease-out',
          }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f5f4ee', fontSize: '11px', color: '#aaa', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {contentData.name || t(language, 'PDF_DOCUMENT')}
            </div>

            {/* Rotate row — Right and Left side by side */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f5f4ee', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#888', fontWeight: 500 }}>{t(language, 'ROTATE')} ({rotation}°)</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => { handleRotateRight(); setPdfMenuOpen(false); }}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px', border: '1px solid #e5e5d8', background: 'white', borderRadius: '7px', cursor: 'pointer', fontSize: '11px', color: '#333', fontFamily: 'inherit' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  {t(language, 'ROTATE_RIGHT')}
                </button>
                <button
                  onClick={() => { handleRotateLeft(); setPdfMenuOpen(false); }}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px', border: '1px solid #e5e5d8', background: 'white', borderRadius: '7px', cursor: 'pointer', fontSize: '11px', color: '#333', fontFamily: 'inherit' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: 'scaleX(-1)' }}><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  {t(language, 'ROTATE_LEFT')}
                </button>
              </div>
            </div>

            {/* Replay */}
            <button
              onClick={() => { setPdfMenuOpen(false); onReplay?.(); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #f5f4ee', textAlign: 'left', fontFamily: 'inherit', fontSize: '13px', color: '#333' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.26"/></svg>
              {t(language, 'REPLAY')}
            </button>

            {/* Download — hidden when portal sets downloadContent: false */}
            {showDownload && (
              <button
                onClick={() => { setPdfMenuOpen(false); handleDownload(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid #f5f4ee', textAlign: 'left', fontFamily: 'inherit', fontSize: '13px', color: '#333' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {t(language, 'DOWNLOAD')}
              </button>
            )}

            {/* Exit */}
            <button
              onClick={() => { setPdfMenuOpen(false); onExit?.(); }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', fontSize: '13px', color: 'var(--sp-brick)', fontWeight: 600 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sp-brick)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              {t(language, 'EXIT')}
            </button>
          </div>
        </>
      );
    };

    // ── Canvas scroll container — ALWAYS rendered at the same DOM position ───
    const canvasScrollArea = (
      <div
        ref={containerRef}
        onScroll={handleScroll}
        {...(isTouch ? { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd } : {})}
        style={{
          position: 'absolute', inset: 0,
          overflow: 'auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '12px', background: '#525659', padding: '16px', boxSizing: 'border-box',
        }}
      >
        {loading ? (
          <div style={{ color: 'white', fontFamily: 'Rubik, sans-serif', fontSize: '14px', marginTop: '40px' }}>
            {t(language, 'LOADING_DOCUMENT')}
          </div>
        ) : (
          Array.from({ length: totalPages }, (_, i) => (
            <canvas
              key={i}
              data-page={i + 1}
              ref={el => { pageRefs.current[i] = el; }}
              style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.35)', background: 'white', maxWidth: '100%' }}
            />
          ))
        )}
      </div>
    );

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
                  {contentData.name || t(language, 'PDF_DOCUMENT')}
                </span>
              </div>
              <ZoomControls />
              <PageNav />
              <MenuBtn />
            </div>
            <div style={{ height: '3px', background: '#f2f1ed', flexShrink: 0 }}>
              <div style={{ height: '100%', background: 'var(--sp-brick)', width: `${progressPercent}%`, transition: 'width 0.35s ease' }} />
            </div>
          </>
        )}

        {/* ── CONTENT WRAPPER (always rendered) ───────────────────────── */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>

          {/* Canvas scroll area — NEVER remounts */}
          {canvasScrollArea}

          {/* ── FLOATING CONTROLS (layout B only) ───────────────────── */}
          {layout === 'B' && (
            <>
              {/* Floating menu button */}
              <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                <button
                  onClick={() => setPdfMenuOpen(o => !o)}
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
                onClick={dir === 'rtl' ? handleNext : handlePrev} onMouseDown={noScroll}
                style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: arrowSize, height: arrowSize, border: 'none',
                  background: dir === 'rtl' ? 'var(--sp-brick)' : 'white',
                  borderRadius: '50%',
                  boxShadow: dir === 'rtl' ? '0 4px 16px rgba(0,0,0,0.2)' : '0 2px 16px rgba(0,0,0,0.14)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: dir === 'rtl' ? 'white' : 'var(--sp-ink)', zIndex: 10
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>

              {/* Right nav arrow */}
              <button
                onClick={dir === 'rtl' ? handlePrev : handleNext} onMouseDown={noScroll}
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: arrowSize, height: arrowSize, border: 'none',
                  background: dir === 'rtl' ? 'white' : 'var(--sp-brick)',
                  borderRadius: '50%',
                  boxShadow: dir === 'rtl' ? '0 2px 16px rgba(0,0,0,0.14)' : '0 4px 16px rgba(0,0,0,0.2)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: dir === 'rtl' ? 'var(--sp-ink)' : 'white', zIndex: 10
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              {/* Floating bottom toolbar — taller, no dividers */}
              <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', background: 'white', borderRadius: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.14)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: '8px', zIndex: 10, height: isTouch ? 52 : 44, whiteSpace: 'nowrap' }}>
                <button onClick={handleZoomOut} onMouseDown={noScroll} style={floatToolBtnStyle}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span style={{ fontSize: '11px', color: '#555', fontWeight: 600, minWidth: '34px', textAlign: 'center' }}>{zoom}%</span>
                <button onClick={handleZoomIn} onMouseDown={noScroll} style={floatToolBtnStyle}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <input
                  type="number" value={page} min={1} max={totalPages || 1}
                  onChange={e => handlePageInput(parseInt(e.target.value))}
                  style={{ width: `${numW}px`, height: `${isTouch ? 38 : 28}px`, border: '1px solid #e8e7e2', borderRadius: '6px', textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#333', outline: 'none', padding: 0 }}
                />
                <span style={{ fontSize: '11px', color: '#aaa' }}>/ {totalPages || 1}</span>
              </div>
            </>
          )}
        </div>

        {/* ── BOTTOM BAR (layout D) ────────────────────────────────────── */}
        {layout === 'D' && (
          <div style={{ height: '50px', borderTop: '1px solid #f2f1ed', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '8px', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                {contentData.name || t(language, 'PDF_DOCUMENT')}
              </span>
            </div>
            <ZoomControls />
            <PageNav />
            <MenuBtn />
          </div>
        )}

        {/* ── MENU DROPDOWN (shared) ───────────────────────────────────── */}
        {renderMenuDropdown()}
      </div>
    );
  }
);

// ── Prevent browser scroll-into-view on button click ──────────────────────
const noScroll = (e: React.MouseEvent) => e.preventDefault();

PdfPlugin.displayName = 'PdfPlugin';

export const PDF_PLUGIN_DEFINITION = {
  mimeTypes: ['application/pdf'],
  component: PdfPlugin,
};

export default PdfPlugin;
