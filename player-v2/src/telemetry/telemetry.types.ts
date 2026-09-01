export interface TelemetryActor {
  id: string;
  type: 'User' | 'System';
}

export interface TelemetryContext {
  channel: string;
  pdata: { id: string; pid: string; ver: string };
  env: string;
  sid: string;
  did: string;
  cdata?: Array<{ id: string; type: string }>;
  rollup?: Record<string, string>;
}

export interface TelemetryObject {
  id: string;
  type: string;
  ver?: string;
  rollup?: Record<string, string>;
}

export interface TelemetryEvent {
  eid: string;
  ets: number;
  ver: string;
  mid: string;
  actor: TelemetryActor;
  context: TelemetryContext;
  object: TelemetryObject;
  edata: Record<string, unknown>;
  tags?: string[];
}

export type TelemetryEid = 'START' | 'END' | 'IMPRESSION' | 'INTERACT' | 'HEARTBEAT' | 'ASSESS' | 'ERROR' | 'LOG';
