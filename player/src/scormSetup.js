/**
 * SCORM 1.2 API Setup
 * Sets up window.API with scorm-again library when available
 * Falls back to inline SCORM API if library is not loaded
 */

(function() {
  'use strict';

  // Check if scorm-again is available (loaded via script tag or npm)
  if (window.Scorm12API) {
    try {
      var scormAPI = new window.Scorm12API({
        autocommit: true,
        autocommitSeconds: 60,
        lmsCommitUrl: '',
        dataCommitFormat: 'json',
        logLevel: 1,
      });

      // Expose on parent window — lock to prevent tampering
      Object.defineProperty(window, 'API', {
        writable: false,
        configurable: false,
        value: scormAPI,
      });

      // Event hooks for real-time telemetry
      function fireTelemetry(eid, edata) {
        if (eid === 'END') {
          if (window.TelemetryService && window.TelemetryService.end) {
            window.TelemetryService.end(edata);
          }
        } else {
          if (window.TelemetryService && window.TelemetryService.interact) {
            window.TelemetryService.interact(edata.type || 'OTHER', edata.id || (edata.subtype || '').toLowerCase(), edata.subtype, edata);
          }
        }
      }

      scormAPI.on('LMSSetValue.cmi.core.score.raw', function(element, value) {
        fireTelemetry('ASSESSMENT', { subtype: 'SCORM_SCORE', score: value });
      });

      scormAPI.on('LMSSetValue.cmi.core.lesson_status', function(element, value) {
        fireTelemetry('INTERACT', { subtype: 'SCORM_STATUS_CHANGE', status: value });
      });

      scormAPI.on('LMSSetValue.cmi.core.exit', function(element, value) {
        fireTelemetry('INTERACT', { subtype: 'SCORM_EXIT_CHANGE', exit: value });
      });

      scormAPI.on('LMSSetValue.cmi.interactions.n.result', function(element, value) {
        fireTelemetry('INTERACT', { subtype: 'SCORM_INTERACTION_RESULT', result: value });
      });

      // LMSCommit and LMSFinish hooks
      scormAPI.on('LMSCommit', function() {
        var state = scormAPI.runtimeData;
        fireTelemetry('INTERACT', { subtype: 'SCORM_COMMIT', state });
      });

      scormAPI.on('LMSFinish', function() {
        var state = scormAPI.runtimeData;
        fireTelemetry('END', { subtype: 'SCORM_FINISH', state });
      });
    } catch (error) {
      console.error('Error initializing SCORM API:', error);
    }
  } else {
    console.warn('scorm-again library not found. SCORM support will fall back to legacy implementation.');
  }
})();
