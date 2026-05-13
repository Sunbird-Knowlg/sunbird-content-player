(function() {
    var scormState = {};
    
    function debugLog(message) {
        // Try to check debug flag from parent window
        try {
            if (window.parent.EkstepRendererAPI && 
                window.parent.EkstepRendererAPI.getGlobalConfig && 
                window.parent.EkstepRendererAPI.getGlobalConfig().debug) {
                console.log(message);
            }
        } catch (e) {
            // Fallback: don't log if cannot access
        }
    }

    debugLog("SCORM Bridge initialized in iframe");
    var API = {
        LMSInitialize: function() {
            window.parent.postMessage({ type: 'SCORM_API', method: 'LMSInitialize' }, '*');
            return 'true';
        },
        LMSGetValue: function(k) {
            return scormState[k] || '';
        },
        LMSSetValue: function(k, v) {
            scormState[k] = v;
            window.parent.postMessage({ type: 'SCORM_API', method: 'LMSSetValue', key: k, value: v }, '*');
            return 'true';
        },
        LMSCommit: function() {
            window.parent.postMessage({ type: 'SCORM_API', method: 'LMSCommit' }, '*');
            return 'true';
        },
        LMSFinish: function() {
            window.parent.postMessage({ type: 'SCORM_API', method: 'LMSFinish' }, '*');
            return 'true';
        },
        LMSGetLastError: function() { return '0'; },
        LMSGetErrorString: function(e) { return 'No error'; },
        LMSGetDiagnostic: function(e) { return 'No diagnostic'; }
    };
    window.API = API;
})();
