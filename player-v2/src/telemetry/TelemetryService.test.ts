import { describe, it, expect, vi } from 'vitest';
import { TelemetryService } from './TelemetryService';
import type { PlayerContext, ContentMetaData } from '../types';
import type { TelemetryEvent } from './telemetry.types';

const context: PlayerContext = {
  uid: 'u1', sid: 's1', did: 'd1', channel: 'ch',
  pdata: { id: 'p', pid: 'pid', ver: '1' },
};
const metadata: ContentMetaData = {
  identifier: 'do_1', name: 'N', mimeType: 'application/pdf', artifactUrl: 'a.pdf', pkgVersion: 2,
};

function make(batchSize = 20) {
  const events: TelemetryEvent[] = [];
  const svc = new TelemetryService(context, metadata, null, (e) => events.push(e), batchSize);
  return { svc, events };
}

describe('TelemetryService', () => {
  it('start emits a START event with content actor/object', () => {
    const { svc, events } = make();
    svc.start();
    expect(events).toHaveLength(1);
    expect(events[0].eid).toBe('START');
    expect(events[0].actor.id).toBe('u1');
    expect(events[0].object.id).toBe('do_1');
    expect(events[0].object.ver).toBe('2');
  });

  it('end reports progress=100 when endpageSeen', () => {
    const { svc, events } = make();
    svc.start();
    svc.end({ totallength: 100, visitedlength: 10 }, true);
    const end = events.find(e => e.eid === 'END')!;
    const summary = end.edata.summary as Array<Record<string, unknown>>;
    expect(summary[0]).toEqual({ progress: 100 });
    expect(end.edata.pageid).toBe('sunbird-player-Endpage');
  });

  it('end computes measured progress when not endpageSeen', () => {
    const { svc, events } = make();
    svc.start();
    svc.end({ totallength: 200, visitedlength: 50 }, false);
    const summary = (events.find(e => e.eid === 'END')!.edata.summary) as Array<Record<string, unknown>>;
    expect(summary[0]).toEqual({ progress: 25 });
  });

  it('end appends score/maxscore when provided', () => {
    const { svc, events } = make();
    svc.start();
    svc.end({ score: 3, maxscore: 5 }, true);
    const summary = (events.find(e => e.eid === 'END')!.edata.summary) as Array<Record<string, unknown>>;
    expect(summary).toEqual(expect.arrayContaining([{ score: 3 }, { maxscore: 5 }]));
  });

  it('interact emits INTERACT with id + type', () => {
    const { svc, events } = make();
    svc.interact('TOUCH', 'replay', '');
    const e = events.find(x => x.eid === 'INTERACT')!;
    expect(e.edata.id).toBe('replay');
    expect(e.edata.type).toBe('TOUCH');
  });

  it('assess emits ASSESS with question id in item.id', () => {
    const { svc, events } = make();
    svc.assess({ questionId: 'q1', score: 1, maxScore: 1, pass: 'Yes' });
    const e = events.find(x => x.eid === 'ASSESS')!;
    expect((e.edata.item as Record<string, unknown>).id).toBe('q1');
    expect(e.edata.pass).toBe('Yes');
  });

  it('impression + error emit their eids', () => {
    const { svc, events } = make();
    svc.impression('2');
    svc.error('boom');
    expect(events.map(e => e.eid)).toEqual(expect.arrayContaining(['IMPRESSION', 'ERROR']));
  });

  it('getElapsedSeconds is 0 before start', () => {
    const { svc } = make();
    expect(svc.getElapsedSeconds()).toBe(0);
  });

  it('batches to the cursor once batchSize is reached', async () => {
    const sendTelemetry = vi.fn().mockResolvedValue(undefined);
    const cursor = { getContent: vi.fn(), sendTelemetry } as never;
    const svc = new TelemetryService(context, metadata, cursor, () => {}, 2);
    svc.interact('TOUCH', 'a', '');
    expect(sendTelemetry).not.toHaveBeenCalled();
    svc.interact('TOUCH', 'b', '');
    expect(sendTelemetry).toHaveBeenCalledTimes(1);
    expect(sendTelemetry.mock.calls[0][0]).toHaveLength(2);
  });

  it('startHeartbeat fires on interval and stopHeartbeat clears it', () => {
    vi.useFakeTimers();
    const { svc, events } = make();
    svc.startHeartbeat(1000, () => ({ currentTime: 5, percent: 10 }));
    vi.advanceTimersByTime(2000);
    svc.stopHeartbeat();
    vi.advanceTimersByTime(2000);
    const beats = events.filter(e => e.edata.type === 'HEARTBEAT');
    expect(beats).toHaveLength(2);
    vi.useRealTimers();
  });
});
