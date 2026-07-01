/** Sunbird Spark brand design tokens — matches PLAYER_DESIGN_SPEC.md */

export const COLORS = {
  brick:       '#a85236',
  brickShade:  '#8f4630',
  ginger:      '#cc8545',
  ink:         '#376673',
  inkShade:    '#305a65',
  wave:        '#70adbf',
  forest:      '#82a668',
  sunflower:   '#ffdb73',
  warmYellow:  '#fff1c7',
  ivory:       '#fffef4',
  obsidian:    '#1a1a1a',
  charcoal:    '#333333',
  gray50:      '#f3f4f6',
  gray100:     '#e5e5d8',
  gray400:     '#aaaaaa',
  gray500:     '#757575',
  gray700:     '#555555',
  white:       '#ffffff',
} as const;

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl:32,
} as const;

export const RADIUS = {
  card:      14,
  thumbnail: 12,
  button:    10,
  menu:      12,
  badge:     20,
  circle:    '50%',
} as const;

export const SHADOWS = {
  card:   '0 6px 30px rgba(0,0,0,0.10)',
  button: '0 2px 10px rgba(0,0,0,0.18)',
  menu:   '0 8px 30px rgba(0,0,0,0.16)',
} as const;

export const FONT_FAMILY = `'Rubik', system-ui, -apple-system, sans-serif`;

export const ANIMATION = {
  pulseCycle:    '1.2s',
  progressSlide: '3s ease-out',
  pulseDelays:   ['0s', '0.22s', '0.44s'],
} as const;

/** MIME types handled by each built-in plugin */
export const MIME_TYPES = {
  html:    ['application/vnd.ekstep.html-archive'],
  h5p:     ['application/vnd.ekstep.h5p-archive'],
  scorm:   ['application/vnd.ekstep.scorm-archive'],
  youtube: ['video/x-youtube'],
  mp4:     ['video/mp4'],
  webm:    ['video/webm'],
  audio:   ['audio/mp3'],
  epub:    ['application/epub'],
  pdf:     ['application/pdf'],
} as const;

export const HEARTBEAT_INTERVAL_MS = 30_000;

export const TELEMETRY_VERSION = '3.0';

/** Player event IDs */
export const PLAYER_EVENTS = {
  START:            'START',
  CONTENT_READY:    'CONTENT_READY',
  CONTENT_FINISHED: 'CONTENT_FINISHED',
  MUTE_TOGGLE:      'MUTE_TOGGLE',
  REPLAY:           'REPLAY',
  EXIT:             'EXIT',
  DONE:             'DONE',
  ERROR:            'ERROR',
} as const;
