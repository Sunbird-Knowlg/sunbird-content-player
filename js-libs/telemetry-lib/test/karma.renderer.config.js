/**
 * Karma Jasmine test setup
 * @author Akash Gupta <akash.gupta@tarento.com>
 */

module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: [
            'jasmine-jquery',
            'jasmine',
            'jasmine-matchers'
        ],
        files: [{pattern: 'http-image/**/*', watched: false, included: false, served: true },
            '../md5.js',
            '../ajv.min.js',
            '../telemetry-spec.js',
            '../telemetrySyncManager.js',
            '../telemetryV3Interface.js',
            '../*.spec.js',
        ],
        exclude: ['coverage'],
        preprocessors: {
            '../telemetryV3Interface.js' : ['coverage'],
            '../telemetrySyncManager.js' : ['coverage']
        },
        reporters: ['verbose', 'progress', 'coverage'],      
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
        junitReporter: {
            outputDir: 'coverage', 
            outputFile: 'test-results.xml',
        },
        coverageReporter: {
            reporters: [{
                type: 'html',
                dir: 'coverage'
            }, {
                type: 'text-summary'
            }, {
                type: 'cobertura'
            }]
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

        proxies: {'http-image': '/base/player/public/js/test'},
        port: 8081,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        client: {captureConsole: false }, 
        browsers: ['PhantomJS'],
        singleRun: false,
        browserNoActivityTimeout: 3000
    })
}