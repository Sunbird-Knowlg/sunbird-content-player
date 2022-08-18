// Karma configuration
// Generated on Tue May 08 2018 12:28:40 GMT+0530 (India Standard Time)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../../../player/',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [
            'jasmine-jquery',
            'jasmine',
            'jasmine-matchers'
        ],


        // list of files / patterns to load in the browser
        files: [
            '../js-libs/telemetry-lib/md5.js',
            'https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js',
            'www/preview/script.min.*.js',
            '../js-libs/telemetry/TelemetryV3Manager.js',
            '../js-libs/telemetry/tememetryv3Manager.spec.js'
        ],


        // list of files to exclude
        exclude: ['coverage'],

        client: {
            captureConsole: false
        },

        plugins: [
            "karma-phantomjs-launcher",
            "karma-jasmine-jquery",
            "karma-jasmine",
            "karma-jasmine-matchers",
            "karma-junit-reporter",
            'karma-coverage',
            "karma-ng-html2js-preprocessor",
            "karma-verbose-reporter",
            "karma-mocha-reporter"
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '../js-libs/telemetry/TelemetryV3Manager.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha', 'verbose', 'progress', 'coverage'],

        // reporter options
        mochaReporter: {
            colors: {
                success: 'green',
                info: 'bgYellow',
                warning: 'cyan',
                error: 'bgRed'
            },
            symbols: {
                success: '✔',
                info: '#',
                warning: '!',
                error: 'x'
            }
        },

        // web server port
        port: 8080,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        coverageReporter: {
            reporters: [
                { type: 'html', dir: '../js-libs/telemetry/test/coverage/' ,
                file : 'coverage.txt'},
                { type: 'text-summary' },
                { type: 'cobertura' }
            ]
        },

        browserNoActivityTimeout: 60000
    })
}