/**
 * ECML body parser: converts raw ECML JSON → EcmlContent (slides or questions)
 * Handles both XML-parsed JSON (with __cdata) and plain JSON data fields.
 */
import type {
  EcmlBody,
  EcmlStage,
  EcmlRawQuestion,
  EcmlQuestion,
  EcmlRawElement,
  EcmlSlide,
  EcmlElement,
  EcmlContent,
  EcmlMediaEntry,
  QuestionType,
  McqData,
  MtfData,
  FtbData,
  SeqData,
  ReorderData,
  McqConfig,
  MtfConfig,
  FtbConfig,
  SeqConfig,
  ReorderConfig,
} from './ecml.types';

function parseCdata<T>(field: unknown): T | null {
  if (!field) return null;
  if (typeof field === 'string') {
    try { return JSON.parse(field) as T; } catch { return null; }
  }
  if (typeof field === 'object' && field !== null) {
    const cdata = (field as Record<string, unknown>).__cdata;
    if (typeof cdata === 'string') {
      try { return JSON.parse(cdata) as T; } catch { return null; }
    }
    return field as T;
  }
  return null;
}

function num(v: unknown, fallback = 0): number {
  const n = parseFloat(String(v));
  return isNaN(n) ? fallback : n;
}

function bool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v === 'true' || v === '1';
  return !!v;
}

function toArray<T>(val: T | T[] | undefined): T[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

/* ─── Question parsing ─── */

function inferType(pluginId: string, data: unknown): QuestionType {
  const id = (pluginId ?? '').toLowerCase();
  if (id.includes('ftb')) return 'ftb';
  if (id.includes('mtf')) return 'mtf';
  if (id.includes('sequence')) return 'sequence';
  if (id.includes('reorder')) return 'reorder';
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (d.sentence) return 'reorder';
    if (d.option && (d.option as Record<string, unknown>).optionsLHS) return 'mtf';
    if (Array.isArray(d.answer) && typeof (d.answer as unknown[])[0] === 'string') return 'ftb';
    if (Array.isArray(d.options) && (d.options as Record<string, unknown>[])[0]?.sequenceOrder !== undefined) return 'sequence';
  }
  return 'mcq';
}

function parseQuestion(raw: EcmlRawQuestion, idx: number): EcmlQuestion | null {
  const pluginId = raw.pluginId ?? raw.plugin ?? 'org.ekstep.questionunit.mcq';
  const data = parseCdata<McqData | MtfData | FtbData | SeqData | ReorderData>(raw.data);
  const config = parseCdata<McqConfig | MtfConfig | FtbConfig | SeqConfig | ReorderConfig>(raw.config) ?? {};
  if (!data) return null;
  const type = inferType(pluginId, data);
  const id = raw.id ?? `q_${idx}`;
  return { id, pluginId, type, data, config } as EcmlQuestion;
}

function parseQuestionsFromStages(stages: EcmlStage[]): EcmlQuestion[] {
  const questions: EcmlQuestion[] = [];
  for (const stage of stages) {
    const qsets = toArray((stage as EcmlStage)['org.ekstep.questionset']);
    for (const qset of qsets) {
      const rawQuestions = toArray(qset['org.ekstep.question']);
      rawQuestions.forEach((rq, i) => {
        const q = parseQuestion(rq, questions.length + i);
        if (q) questions.push(q);
      });
    }
  }
  return questions;
}

/* ─── Slide/element parsing ─── */

function parseShapeElement(raw: EcmlRawElement, idx: number): EcmlElement {
  return {
    _type: 'shape',
    id: raw.id ?? `shape_${idx}`,
    x: num(raw.x),
    y: num(raw.y),
    w: num(raw.w),
    h: num(raw.h),
    type: String(raw.type ?? 'rect'),
    fill: raw.fill ? String(raw.fill) : undefined,
    stroke: raw.stroke ? String(raw.stroke) : undefined,
    'stroke-width': raw['stroke-width'] !== undefined ? num(raw['stroke-width']) : (raw.strokeWidth !== undefined ? num(raw.strokeWidth) : undefined),
    r: raw.r !== undefined ? num(raw.r) : (raw.radius !== undefined ? num(raw.radius) : undefined),
    rotate: raw.rotate !== undefined ? num(raw.rotate) : undefined,
    opacity: raw.opacity !== undefined ? num(raw.opacity) : undefined,
    visible: raw.visible !== undefined ? bool(raw.visible) : true,
  };
}

function parseImageElement(raw: EcmlRawElement, idx: number, mediaMap: Record<string, string>): EcmlElement {
  const assetId = raw.asset ? String(raw.asset) : undefined;
  const src = assetId && mediaMap[assetId] ? mediaMap[assetId] : (raw.src ? String(raw.src) : undefined);
  return {
    _type: 'image',
    id: raw.id ?? `img_${idx}`,
    x: num(raw.x),
    y: num(raw.y),
    w: num(raw.w),
    h: num(raw.h),
    asset: assetId,
    src,
    rotate: raw.rotate !== undefined ? num(raw.rotate) : undefined,
    opacity: raw.opacity !== undefined ? num(raw.opacity) : undefined,
    visible: raw.visible !== undefined ? bool(raw.visible) : true,
  };
}

function parseTextElement(raw: EcmlRawElement, idx: number): EcmlElement {
  // text content can be in __cdata or direct string child
  let text: string | undefined;
  if (typeof raw.__text === 'string') text = raw.__text;
  else if (typeof raw._text === 'string') text = raw._text;
  else if (typeof raw.text === 'string') text = raw.text;
  else {
    const cdata = parseCdata<{ text?: string } | string>(raw as unknown as { __cdata?: string });
    if (typeof cdata === 'string') text = cdata;
    else if (cdata && typeof cdata === 'object' && 'text' in cdata) text = cdata.text;
  }

  return {
    _type: 'text',
    id: raw.id ?? `text_${idx}`,
    x: num(raw.x),
    y: num(raw.y),
    w: num(raw.w),
    h: num(raw.h),
    text,
    font: raw.font ? String(raw.font) : undefined,
    fontsize: raw.fontsize !== undefined ? num(raw.fontsize) : undefined,
    color: raw.color ? String(raw.color) : undefined,
    align: raw.align ? String(raw.align) : undefined,
    shadow: raw.shadow ? String(raw.shadow) : undefined,
    weight: raw.weight ? String(raw.weight) : undefined,
    rotate: raw.rotate !== undefined ? num(raw.rotate) : undefined,
    opacity: raw.opacity !== undefined ? num(raw.opacity) : undefined,
    visible: raw.visible !== undefined ? bool(raw.visible) : true,
  };
}

function parseAudioElement(raw: EcmlRawElement, mediaMap: Record<string, string>): EcmlElement {
  const assetId = raw.asset ? String(raw.asset) : undefined;
  const src = assetId && mediaMap[assetId] ? mediaMap[assetId] : (raw.src ? String(raw.src) : undefined);
  return {
    _type: 'audio',
    asset: assetId,
    src,
    autoplay: raw.autoplay !== undefined ? bool(raw.autoplay) : false,
  };
}

function buildMediaMap(body: EcmlBody): Record<string, string> {
  const map: Record<string, string> = {};
  const mediaArr = toArray(
    body.theme?.manifest?.media ?? body.manifest?.media
  ) as EcmlMediaEntry[];
  for (const m of mediaArr) {
    if (m.id && m.src) map[m.id] = m.src;
  }
  return map;
}

function parseSlide(stage: EcmlStage, mediaMap: Record<string, string>): EcmlSlide {
  const elements: EcmlElement[] = [];

  // Config may contain background color
  const cfg = parseCdata<{ color?: string }>(stage.config ?? null);
  const background = cfg?.color;

  // Parse each element type
  toArray(stage.shape as EcmlRawElement[]).forEach((el, i) => {
    elements.push(parseShapeElement(el, i));
  });

  toArray(stage.image as EcmlRawElement[]).forEach((el, i) => {
    elements.push(parseImageElement(el, i, mediaMap));
  });

  toArray(stage.text as EcmlRawElement[]).forEach((el, i) => {
    elements.push(parseTextElement(el, i));
  });

  toArray(stage.audio as EcmlRawElement[]).forEach((el) => {
    elements.push(parseAudioElement(el, mediaMap));
  });

  // Sort by z-index if present
  elements.sort((a, b) => {
    const az = ('z-index' in a ? (a as { 'z-index'?: number })['z-index'] : undefined) ?? 0;
    const bz = ('z-index' in b ? (b as { 'z-index'?: number })['z-index'] : undefined) ?? 0;
    return az - bz;
  });

  // Parse inline question-sets within this stage
  const questions: EcmlQuestion[] = [];
  const qsets = toArray((stage as EcmlStage)['org.ekstep.questionset']);
  for (const qset of qsets) {
    const rawQuestions = toArray(qset['org.ekstep.question']);
    rawQuestions.forEach((rq, i) => {
      const q = parseQuestion(rq, questions.length + i);
      if (q) questions.push(q);
    });
  }

  return { id: stage.id, background, elements, questions };
}

/* ─── Main export ─── */

export function parseEcmlContent(body: EcmlBody): EcmlContent {
  const stages = toArray(body.theme?.stage);
  const mediaMap = buildMediaMap(body);

  // Check if content is question-set only (all stages have only questionsets, no visual elements)
  const totalQuestions = parseQuestionsFromStages(stages);

  const hasVisualElements = stages.some(stage => {
    return (
      toArray(stage.shape as EcmlRawElement[]).length > 0 ||
      toArray(stage.image as EcmlRawElement[]).length > 0 ||
      toArray(stage.text as EcmlRawElement[]).length > 0 ||
      toArray(stage.video as EcmlRawElement[]).length > 0
    );
  });

  // If ONLY question-sets (no slides/shapes/images), use question mode
  if (totalQuestions.length > 0 && !hasVisualElements) {
    return { mode: 'questions', questions: totalQuestions };
  }

  // Slide mode: render each stage as a visual slide (may embed question-sets)
  const slides = stages.map(stage => parseSlide(stage, mediaMap));
  return { mode: 'slides', slides, mediaMap };
}

/** Legacy export — still used by QuestionSet path */
export function parseEcmlBody(body: EcmlBody): EcmlQuestion[] {
  const content = parseEcmlContent(body);
  if (content.mode === 'questions') return content.questions;
  // Flatten questions from all slides
  return content.slides.flatMap(s => s.questions);
}

/**
 * Fetch ECML content body from artifactUrl (extracted zip directory).
 * artifactUrl must point to a directory containing index.json, not a zip file.
 * Returns null if fetch fails or artifactUrl looks like a zip/ecar file.
 */
export async function fetchEcmlBody(artifactUrl: string): Promise<EcmlBody | null> {
  if (/\.(zip|ecar)(\?.*)?$/i.test(artifactUrl)) return null;
  const base = artifactUrl.replace(/\/?$/, '/');
  try {
    const res = await fetch(`${base}index.json`);
    if (res.ok) return (await res.json()) as EcmlBody;
  } catch { /* fall through */ }
  return null;
}

/**
 * Coerce an inline body value (from content read API) to EcmlBody.
 */
export function parseInlineBody(body: unknown): EcmlBody | null {
  if (!body) return null;
  if (typeof body === 'string') {
    try { return JSON.parse(body) as EcmlBody; } catch { return null; }
  }
  if (typeof body === 'object') return body as EcmlBody;
  return null;
}
