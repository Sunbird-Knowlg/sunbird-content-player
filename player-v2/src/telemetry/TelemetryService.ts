import type { PlayerContext, ContentMetaData } from '../types';
import type { TelemetryEvent, TelemetryEid } from './telemetry.types';
import type { ContentCursor } from '../services/ContentCursor';
import { TELEMETRY_VERSION } from '../constants';

let _midCounter = 0;
function mid(): string { return `${Date.now()}-${++_midCounter}`; }

export interface PlaySummary {
  totallength: number;
  visitedlength: number;
  visitedcontentend: boolean;
  totalseekedlength: number;
  /** Assessment score accumulated for ECML/question content (added to END summary). */
  score?: number;
  maxscore?: number;
}

/** Per-question assessment payload — mirrors old qspatch.js ASSESS edata.item. */
export interface AssessData {
  questionId: string;
  /** mcq | mtf | ftb | sequence | reorder */
  qtype?: string;
  index?: number;
  score: number;
  maxScore: number;
  pass: 'Yes' | 'No';
  /** selected response values */
  resvalues?: Array<Record<string, unknown>>;
  title?: string;
  desc?: string;
}

type EventCallback = (event: TelemetryEvent) => void;

export class TelemetryService {
  private context: PlayerContext;
  private metadata: ContentMetaData;
  private onEvent: EventCallback;
  private cursor: ContentCursor | null;
  private batch: TelemetryEvent[] = [];
  private batchSize: number;
  private startTime: number = 0;
  private appStartTime: number = Date.now();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private pageid: string;

  constructor(
    context: PlayerContext,
    metadata: ContentMetaData,
    cursor: ContentCursor | null,
    onEvent: EventCallback,
    batchSize = 20,
  ) {
    this.context = context;
    this.metadata = metadata;
    this.cursor   = cursor;
    this.onEvent  = onEvent;
    this.batchSize = batchSize;
    this.pageid = metadata.identifier;
  }

  private buildEvent(eid: TelemetryEid, edata: Record<string, unknown>): TelemetryEvent {
    return {
      eid,
      ets: Date.now(),
      ver: TELEMETRY_VERSION,
      mid: mid(),
      actor: { id: this.context.uid, type: 'User' },
      context: {
        channel: this.context.channel,
        pdata:   this.context.pdata,
        env:     'contentplayer',
        sid:     this.context.sid,
        did:     this.context.did,
        cdata:   this.context.cdata,
        rollup:  this.context.rollup,
      },
      object: {
        id:   this.metadata.identifier,
        type: 'Content',
        ver:  String(this.metadata.pkgVersion ?? 1),
      },
      edata,
    };
  }

  private emit(event: TelemetryEvent): void {
    this.onEvent(event);
    if (this.cursor) {
      this.batch.push(event);
      if (this.batch.length >= this.batchSize) this.flush();
    }
  }

  private flush(): void {
    if (!this.cursor || this.batch.length === 0) return;
    const toSend = this.batch.splice(0);
    this.cursor.sendTelemetry(toSend).catch(() => {});
  }

  /** Returns elapsed seconds since start() was called. 0 if not started. */
  getElapsedSeconds(): number {
    if (!this.startTime) return 0;
    return Math.round((Date.now() - this.startTime) / 1000);
  }

  /**
   * OE_START / START
   * edata matches TelemetryV3Manager.start() exactly:
   * { type, mode, pageid, duration }
   */
  start(): void {
    this.startTime = Date.now();
    this.emit(this.buildEvent('START', {
      type:     'content',
      mode:     'play',
      pageid:   this.pageid,
      duration: Number(((this.startTime - this.appStartTime) / 1000).toFixed(2)),
      uaspec:   { agent: navigator.userAgent },
    }));
  }

  /**
   * OE_END / END
   * summary matches TelemetryV3Manager.end() + contentPlaySummary():
   * [progress, totallength, visitedlength, visitedcontentend, totalseekedlength, endpageseen]
   */
  end(playSummary?: Partial<PlaySummary>, endpageSeen = false): void {
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    /*
     * Genuine completion (endpageSeen — fired from content-finished / done) reports
     * progress=100, matching the old player. The portal's content-progress calculator
     * marks SCORM/ECML completed only when progress>=100, so this is what flips course
     * content state to "completed". Non-completion exits keep the measured progress.
     */
    const progress = endpageSeen
      ? 100
      : playSummary?.totallength
        ? Math.min(100, Math.round((playSummary.visitedlength ?? 0) / playSummary.totallength * 100))
        : 50;

    this.stopHeartbeat();
    const summary: Array<Record<string, unknown>> = [
      { progress },
      { totallength:       playSummary?.totallength       ?? 0 },
      { visitedlength:     playSummary?.visitedlength     ?? 0 },
      { visitedcontentend: playSummary?.visitedcontentend ?? endpageSeen },
      { totalseekedlength: playSummary?.totalseekedlength ?? 0 },
      { endpageseen:       endpageSeen },
    ];
    /* Assessment content: carry the score in END summary (matches video player summary[6]). */
    if (playSummary?.score !== undefined) {
      summary.push({ score: playSummary.score });
      summary.push({ maxscore: playSummary.maxscore ?? 0 });
    }
    this.emit(this.buildEvent('END', {
      type:   'content',
      mode:   'play',
      // Matches reference players (pdf/video/epub): END pageid is the end-page marker
      pageid: 'sunbird-player-Endpage',
      summary,
      duration,
    }));
    this.flush();
  }

  /**
   * IMPRESSION — page/stage view. Matches reference players (pdf/video/epub)
   * raiseImpressionTelemetry: edata { type:'workflow', subtype:'', pageid, uri:'' }.
   * Fired on page navigation (PDF/EPUB page change) so dashboards see per-page views.
   */
  impression(pageid: string, extra?: Record<string, unknown>): void {
    this.emit(this.buildEvent('IMPRESSION', {
      type:    'workflow',
      subtype: '',
      pageid:  pageid || this.pageid,
      uri:     '',
      ...(extra ? { extra: [extra] } : {}),
    }));
  }

  /**
   * INTERACT — matches TelemetryV3Manager.interact():
   * edata: { type, subtype, id, pageid, extra: [{ stageId, values }] }
   *
   * type:    TOUCH | HEARTBEAT | SCREENSHARE | etc.
   * subtype: PLAY | PAUSE | DRAG (seek) | STOP | CHANGE | SCORM_* | etc.
   */
  interact(
    type: string,
    id: string,
    subtype: string,
    extra?: Record<string, unknown>,
  ): void {
    this.emit(this.buildEvent('INTERACT', {
      type,
      subtype,
      id,
      pageid: this.pageid,
      extra:  extra ? [{ stageId: this.pageid, ...extra }] : [],
    }));
  }

  /**
   * HEARTBEAT — old player fires as INTERACT with type=HEARTBEAT, not a separate eid.
   * Matches: EkstepRendererAPI.getTelemetryService().interact("HEARTBEAT", "", "", heartBeatData)
   */
  heartbeat(data?: Record<string, unknown>): void {
    this.interact('HEARTBEAT', '', '', { stageId: this.pageid, ...data });
  }

  /**
   * ASSESS — per-question scored interaction. Matches old qspatch.js / TelemetryV3Manager.assessEnd:
   * edata { item{id:qid,type,maxscore,exlength,params,uri,title,mmc,mc,desc}, index, pass, score, resvalues, duration }.
   * item.id is the QUESTION id (not the content id) so external platforms can attribute scores.
   */
  assess(data: AssessData): void {
    this.emit(this.buildEvent('ASSESS', {
      item: {
        id:       data.questionId,
        type:     data.qtype ?? 'mcq',
        maxscore: data.maxScore,
        exlength: 0,
        params:   [],
        uri:      '',
        title:    data.title ?? '',
        mmc:      [],
        mc:       [],
        desc:     data.desc ?? data.title ?? '',
      },
      index:     data.index ?? 1,
      pass:      data.pass,
      score:     data.score,
      resvalues: data.resvalues ?? [{ [data.questionId]: String(data.score) }],
      duration:  Math.round((Date.now() - this.startTime) / 1000),
    }));
  }

  error(err: string, type = 'content'): void {
    this.emit(this.buildEvent('ERROR', {
      err,
      errtype:    type,
      stacktrace: '',
    }));
  }

  startHeartbeat(
    intervalMs: number,
    getProgress: () => { currentTime?: number; percent?: number },
  ): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      const p = getProgress();
      this.heartbeat({ currentTime: p.currentTime, progress: p.percent });
    }, intervalMs);
  }

  stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  destroy(): void {
    this.stopHeartbeat();
    this.flush();
  }
}
