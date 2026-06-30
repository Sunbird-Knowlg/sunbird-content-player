window.SCORM_PROFILES = {
    '1.2': {
        wrapperClass: 'Scorm12API',
        apiNamespace: 'API',
        statusKey: 'cmi.core.lesson_status',
        scoreKey: 'cmi.core.score.raw',
        exitKey: 'cmi.core.exit',
        defaultState: {
            'cmi.core.lesson_status': 'not attempted'
        },
        methods: {
            init: 'LMSInitialize',
            get: 'LMSGetValue',
            set: 'LMSSetValue',
            commit: 'LMSCommit',
            finish: 'LMSFinish',
            lastError: 'LMSGetLastError',
            errorString: 'LMSGetErrorString',
            diagnostic: 'LMSGetDiagnostic'
        },
        isComplete: function (state) {
            var value = state['cmi.core.lesson_status'];
            return value === 'completed' || value === 'passed';
        },
        isFailed: function (state) {
            return state['cmi.core.lesson_status'] === 'failed';
        }
    },
    '2004': {
        wrapperClass: 'Scorm2004API',
        apiNamespace: 'API_1484_11',
        statusKey: 'cmi.completion_status',
        successKey: 'cmi.success_status',
        scoreKey: 'cmi.score.raw',
        exitKey: 'cmi.exit',
        defaultState: {
            'cmi.completion_status': 'unknown',
            'cmi.success_status': 'unknown'
        },
        methods: {
            init: 'Initialize',
            get: 'GetValue',
            set: 'SetValue',
            commit: 'Commit',
            finish: 'Terminate',
            lastError: 'GetLastError',
            errorString: 'GetErrorString',
            diagnostic: 'GetDiagnostic'
        },
        isComplete: function (state) {
            return state['cmi.completion_status'] === 'completed';
        },
        isFailed: function (state) {
            return state['cmi.success_status'] === 'failed';
        }
    }
};