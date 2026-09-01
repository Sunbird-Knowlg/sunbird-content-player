# @project-sunbird/content-player-v2

A React + TypeScript content player library for Sunbird. It renders every Sunbird
content type through a single **plugin-registry shell** — one mount point, one
telemetry pipeline, one theme — instead of a separate web-component per format.

It ships as an ES/UMD library (React 18 peer dependency) and also exposes a
zero-React `mount()` / `init()` API so vanilla-JS or web-component hosts can embed
it without knowing React.

---

## Supported content

| Content | MIME type(s) | Plugin | Notes |
|---|---|---|---|
| **ECML** (questions) | `application/vnd.ekstep.ecml-archive` | `EcmlPlugin` | MCQ (7 templates), True/False, FTB, MTF, Sequence, Reorder — with review + assessment summary |
| **ECML** (slides) | `application/vnd.ekstep.ecml-archive` | `EcmlPlugin` | Stage renderer: shapes, images, text, audio + embedded question-sets |
| **PDF** | `application/pdf` | `PdfPlugin` | PDF.js, page nav, zoom, rotate, download |
| **EPUB** | `application/epub`, `application/epub+zip` | `EpubPlugin` | epub.js, paginated, page nav, download |
| **Video** | `video/mp4`, `video/webm` | `VideoPlugin` | native `<video>`, fullscreen, seek |
| **Audio** | `audio/mp3` | `VideoPlugin` | audio via the video plugin |
| **YouTube** | `video/x-youtube` | `YoutubePlugin` | IFrame Player API |
| **HTML / H5P / SCORM** | `application/vnd.ekstep.html-archive`, `…h5p-archive`, `…scorm-archive` | `HtmlPlugin` | iframe host; SCORM 1.2/2004 via `scorm-again`; multi-SCO nav |
| **Unknown** | any unmapped MIME | `GenericPlugin` | graceful "not supported" fallback |

Anything not matched by a registered plugin falls back to `GenericPlugin`, so the
shell never hard-crashes on an unknown MIME type.

---

## Features

- **Plugin registry** — resolve a plugin by MIME type; register custom plugins via
  `config.plugins` (host plugins take precedence over built-ins).
- **Unified telemetry** — Sunbird Telemetry v3 (`START`, `END`, `INTERACT`,
  `IMPRESSION`, `ASSESS`, `ERROR`, `HEARTBEAT`) built once in `TelemetryService`,
  batched, and forwarded to the host via `onTelemetryEvent` and/or a `ContentCursor`.
  END fires only on genuine completion (replay/exit emit `INTERACT`, never `END`).
- **Assessment scoring** — per-question `ASSESS` events (with `item.maxscore`) are
  emitted for **every** question on submit, so course/collection Best-Score
  aggregation gets a correct total.
- **Responsive** — container-query (`cqi`) driven sizing; adapts to standalone,
  collection/course embed, and phone (portrait/landscape) without breakpoint churn.
- **i18n + RTL** — `t(language, key)` across shell **and** all plugins; bundled
  locales: `en, hi, ta, ar, fr, pt`; automatic `dir=rtl` for `ar/he/fa/ur`.
- **Offline-ready** — `config.assets` overrides CDN paths for PDF.js/epub.js/JSZip;
  local `basePath` resolution for downloaded content (Capacitor/mobile).
- **Configurable UI** — `menuBar`, `controlsLocation` (top/bottom/floating),
  `downloadContent` (PDF/EPUB download menu item).
- **Themed** — Sunbird Spark brand tokens (`COLORS`, Rubik font) in `player.css`.

---

## Install

```bash
npm install @project-sunbird/content-player-v2 react react-dom
```

Import the stylesheet once:

```ts
import '@project-sunbird/content-player-v2/dist/sunbird-player.css';
```

---

## Usage

### React

```tsx
import { PlayerShell } from '@project-sunbird/content-player-v2';

<PlayerShell
  playerConfig={{
    metadata,          // ContentMetaData (identifier, name, mimeType, artifactUrl, …)
    context,           // PlayerContext (uid, sid, did, channel, pdata, …)
    config: {
      language: 'en',
      menuBar: true,
      controlsLocation: 'default',
      downloadContent: true,
    },
  }}
  onPlayerEvent={(e) => {/* START / CONTENT_FINISHED / EXIT / … */}}
  onTelemetryEvent={(e) => {/* v3 telemetry */}}
/>
```

### Vanilla JS (UMD) — no React in the host

```js
// fetches content via cursor.getContent(contentId), then renders
SunbirdPlayer.mount({
  container: document.getElementById('player'),
  contentId: 'do_123',
  cursor: new SunbirdPlayer.ContentService('https://dev.sunbirded.org', 'Bearer …'),
  context,
  onTelemetryEvent: (e) => {/* … */},
});

// or, when you already have metadata:
SunbirdPlayer.init({ container, playerConfig, onTelemetryEvent });
```

`ContentCursor` is the host-provided data contract (`getContent`, `sendTelemetry`).
`ContentService` is the default implementation (direct Sunbird API fetch); subclass
`ContentCursor` to proxy through your own backend.

---

## Configuration (`playerConfig.config`)

| Option | Type | Default | Purpose |
|---|---|---|---|
| `language` | BCP-47 string | `en` | UI language + text direction |
| `plugins` | `PluginDefinition[]` | – | extra/override plugins |
| `assets` | `PlayerAssets` | CDN | offline script paths (PDF.js/epub.js/JSZip) |
| `menuBar` | boolean | `true` | show/hide the ⋮ options menu |
| `controlsLocation` | `top \| bottom \| default` | `default` | PDF/EPUB controls bar position |
| `downloadContent` | boolean | `true` | show the Download menu item (PDF/EPUB) |
| `telemetry` | `TelemetryConfig` | – | batch size / endpoint / heartbeat |

---

## Architecture

```
PlayerShell ──► PlayingScreen ──► PluginRenderer ──► <Plugin> (by MIME type)
     │                                                  ▲
     ├─ LoadingScreen / EndScreen / StartScreen         │ registered in
     ├─ TelemetryService (v3, batched)                  │ PluginRegistry
     └─ i18n (t/getDir)                                 │
```

- `PlayerShell` owns lifecycle, screen state, and telemetry.
- `PluginRegistry` maps MIME → plugin; `PluginRenderer` resolves & mounts.
- Each plugin implements `ContentPluginProps` (in) / `ContentPluginRef` (replay/mute).
- ECML is the largest plugin: `ecml.parser` → `QuestionSet` / `EcmlSlideRenderer`
  → per-type question components; drag interactions via `usePointerDrag`.

---

## Development

```bash
npm install
npm run dev        # Vite dev server (dev-harness.tsx)
npm run build      # tsc + Vite library build (ES + UMD + d.ts)
npm run lint       # ESLint
npm run test       # Vitest (watch)
npm run test:run   # Vitest (single run)
```

Tests cover i18n, ContentService, TelemetryService, screens, the plugin registry,
plugin definitions, and the generic plugin.

---

## CI / Publish

`.github/workflows/player-v2.yml` (repo root):

- **CI** — lint + test + build on every push / PR touching `player-v2/**`.
- **Publish** — `npm publish --access public` when a `player-v2-v*` tag is pushed.
  (No blob-storage publish.)
