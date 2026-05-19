import { Scorm12API } from 'scorm-again';

const scormAPI = new Scorm12API({
  autocommit: true,
  autocommitSeconds: 60,
  lmsCommitUrl: '/api/scorm/commit',
  dataCommitFormat: 'json',
  logLevel: 1,
});

// Expose on parent window — lock to prevent tampering
Object.defineProperty(window, 'API', {
  writable: false,
  configurable: false,
  value: scormAPI,
});
Object.freeze(scormAPI);

// Event hooks for real-time telemetry
function fireTelemetry(eid, edata) {
  console.log('fireTelemetry called', eid, edata);
  if (eid === 'END') {
    TelemetryService.end(edata);
  } else {
    TelemetryService.interact(edata.type || 'OTHER', edata.id || edata.subtype.toLowerCase(), edata.subtype, edata);
  }
}

scormAPI.on('LMSSetValue.cmi.core.score.raw', (element, value) => {
  fireTelemetry('ASSESMENT', { subtype: 'SCORM_SCORE', score: value });
});

scormAPI.on('LMSSetValue.cmi.core.lesson_status', (element, value) => {
  fireTelemetry('INTERACT', { subtype: 'SCORM_STATUS_CHANGE', status: value });
});

scormAPI.on('LMSSetValue.cmi.core.exit', (element, value) => {
  fireTelemetry('INTERACT', { subtype: 'SCORM_EXIT_CHANGE', exit: value });
});

scormAPI.on('LMSSetValue.cmi.interactions.n.result', (element, value) => {
  fireTelemetry('INTERACT', { subtype: 'SCORM_INTERACTION_RESULT', result: value });
});

// LMSCommit and LMSFinish hooks
scormAPI.on('LMSCommit', () => {
  const state = scormAPI.runtimeData;
  fireTelemetry('INTERACT', { subtype: 'SCORM_COMMIT', state });
});

scormAPI.on('LMSFinish', () => {
  console.log('LMSFinish event received');
  const state = scormAPI.runtimeData;
  fireTelemetry('END', { subtype: 'SCORM_FINISH', state });
});

// Note: sendBeacon removed — telemetry is write-only, not persisting to backend

export default scormAPI;
