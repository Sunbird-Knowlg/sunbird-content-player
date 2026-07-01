/** ECML content data structures — derived from sunbird-content-plugins analysis */

export type QuestionType = 'mcq' | 'mtf' | 'ftb' | 'reorder' | 'sequence';

/* ─── Question data shapes (parsed from ECML __cdata JSON) ─── */

export interface McqOption {
  text?: string;
  image?: string;
  audio?: string;
  isCorrect?: boolean;
}

export interface McqData {
  question: { text?: string; image?: string; audio?: string };
  options: McqOption[];
}

export interface McqConfig {
  layout?: string;
  isShuffleOption?: boolean;
  max_score?: number;
  partial_scoring?: boolean;
}

/* MTF */
export interface MtfOption {
  text?: string;
  image?: string;
  audio?: string;
}

export interface MtfData {
  question: { text?: string; image?: string; audio?: string };
  option: {
    optionsLHS: MtfOption[];
    optionsRHS: MtfOption[];
  };
}

export interface MtfConfig {
  layout?: string;
  partial_scoring?: boolean;
  max_score?: number;
}

/* FTB */
export interface FtbData {
  question: { text?: string; image?: string; audio?: string };
  answer: string[];
}

export interface FtbConfig {
  evalUnordered?: boolean;
  partial_scoring?: boolean;
  max_score?: number;
  metadata?: any
}

/* Sequence */
export interface SeqOption {
  text?: string;
  image?: string;
  sequenceOrder?: number;
}

export interface SeqData {
  question: { text?: string; image?: string; audio?: string };
  options: SeqOption[];
}

export interface SeqConfig {
  layout?: string;
  partial_scoring?: boolean;
  max_score?: number;
}

/* Reorder (word arrange) */
export interface ReorderTab {
  id: number;
  text: string;
}

export interface ReorderData {
  question: { text?: string; image?: string; audio?: string };
  sentence: {
    text: string;
    tabs: ReorderTab[];
  };
}

export interface ReorderConfig {
  max_score?: number;
}

/* ─── Unified question unit ─── */
export interface EcmlQuestion {
  id: string;
  pluginId: string;
  type: QuestionType;
  data: McqData | MtfData | FtbData | SeqData | ReorderData;
  config: McqConfig | MtfConfig | FtbConfig | SeqConfig | ReorderConfig;
}

/* ─── Answer result from each question ─── */
export interface QuestionResult {
  questionId: string;
  type: QuestionType;
  score: number;
  maxScore: number;
  pass: boolean;
  /** user's raw answer state for review mode */
  state: QuestionAnswerState;
}

/* ─── Per-type answer state (stored for review) ─── */
export type QuestionAnswerState =
  | McqAnswerState
  | MtfAnswerState
  | FtbAnswerState
  | SeqAnswerState
  | ReorderAnswerState;

export interface McqAnswerState {
  type: 'mcq';
  selectedIndex: number | null;
  /** shuffled options order at time of answering */
  options: McqOption[];
}

export interface MtfAnswerState {
  type: 'mtf';
  /** current position order of RHS items (index into original optionsRHS) */
  rhsOrder: number[];
  lhsOptions: MtfOption[];
  rhsOptions: MtfOption[];
}

export interface FtbAnswerState {
  type: 'ftb';
  answers: string[];
}

export interface SeqAnswerState {
  type: 'sequence';
  /** current order (each value is original sequenceOrder-1 index) */
  currentOrder: number[];
  options: SeqOption[];
}

export interface ReorderAnswerState {
  type: 'reorder';
  selectedWords: Array<{ id: string; text: string }>;
  tabs: ReorderTab[];
}

/* ─── ECML stage element types (for slide rendering) ─── */

export interface EcmlElementBase {
  id?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  visible?: boolean | string;
  rotate?: number;
  opacity?: number;
  'z-index'?: number;
}

export interface EcmlShapeElement extends EcmlElementBase {
  _type: 'shape';
  type: string; // rect, roundrect, circle, ellipse, star, trapezium
  fill?: string;
  stroke?: string;
  'stroke-width'?: number;
  strokeWidth?: number;
  r?: number; // radius for roundrect/circle/ellipse
}

export interface EcmlImageElement extends EcmlElementBase {
  _type: 'image';
  asset?: string;
  src?: string; // resolved URL
}

export interface EcmlTextElement extends EcmlElementBase {
  _type: 'text';
  text?: string;
  font?: string;
  fontsize?: number;
  color?: string;
  align?: string;
  shadow?: string;
  weight?: string;
}

export interface EcmlAudioElement {
  _type: 'audio';
  asset?: string;
  src?: string;
  autoplay?: boolean;
}

export type EcmlElement = EcmlShapeElement | EcmlImageElement | EcmlTextElement | EcmlAudioElement;

export interface EcmlSlide {
  id: string;
  background?: string;
  elements: EcmlElement[];
  questions: EcmlQuestion[];
}

/* ─── Parsed ECML content (discriminated union) ─── */
export type EcmlContent =
  | { mode: 'slides'; slides: EcmlSlide[]; mediaMap: Record<string, string> }
  | { mode: 'questions'; questions: EcmlQuestion[] };

/* ─── ECML content body structure (after JSON parse) ─── */
export interface EcmlBody {
  theme?: {
    stage?: EcmlStage | EcmlStage[];
    'plugin-manifest'?: { plugin?: EcmlPluginManifestEntry | EcmlPluginManifestEntry[] };
    startStage?: string;
    manifest?: { media?: EcmlMediaEntry | EcmlMediaEntry[] };
  };
  manifest?: { media?: EcmlMediaEntry | EcmlMediaEntry[] };
}

export interface EcmlMediaEntry {
  id: string;
  src?: string;
  type?: string;
}

export interface EcmlStage {
  id: string;
  x?: number | string;
  y?: number | string;
  w?: number | string;
  h?: number | string;
  config?: string | { __cdata?: string };
  'org.ekstep.questionset'?: EcmlQuestionSetElement | EcmlQuestionSetElement[];
  shape?: EcmlRawElement | EcmlRawElement[];
  image?: EcmlRawElement | EcmlRawElement[];
  text?: EcmlRawElement | EcmlRawElement[];
  audio?: EcmlRawElement | EcmlRawElement[];
  video?: EcmlRawElement | EcmlRawElement[];
  manifest?: { media?: EcmlMediaEntry | EcmlMediaEntry[] };
  [key: string]: unknown;
}

export interface EcmlRawElement {
  id?: string;
  x?: number | string;
  y?: number | string;
  w?: number | string;
  h?: number | string;
  type?: string;
  fill?: string;
  stroke?: string;
  'stroke-width'?: number | string;
  strokeWidth?: number | string;
  r?: number | string;
  corners?: number | string;
  sides?: number | string;
  radius?: number | string;
  asset?: string;
  src?: string;
  font?: string;
  fontsize?: number | string;
  color?: string;
  align?: string;
  shadow?: string;
  weight?: string;
  visible?: boolean | string;
  rotate?: number | string;
  opacity?: number | string;
  autoplay?: boolean | string;
  config?: string | { __cdata?: string };
  [key: string]: unknown;
}

export interface EcmlQuestionSetElement {
  id?: string;
  data?: string | { __cdata?: string };
  config?: string | { __cdata?: string };
  'org.ekstep.question'?: EcmlRawQuestion | EcmlRawQuestion[];
}

export interface EcmlRawQuestion {
  id?: string;
  'pluginId'?: string;
  plugin?: string;
  data?: string | { __cdata?: string };
  config?: string | { __cdata?: string };
}

export interface EcmlPluginManifestEntry {
  id: string;
  ver?: string;
  type?: string;
}

/* ─── Assessment session state (full, for submit-confirm screen) ─── */
export interface AssessmentState {
  questions: EcmlQuestion[];
  results: Map<string, QuestionResult>;
  currentIndex: number;
  /** questions explicitly marked for review */
  markedForReview: Set<string>;
  mode: 'answering' | 'review' | 'submitted';
}
