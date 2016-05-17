// Karma configuration
// Generated on Tue Feb 23 2016 13:39:55 GMT+0530 (IST)

module.exports = function(config) {
  config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [
            'jasmine',
            'jasmine-matchers'
        ],


        // list of files / patterns to load in the browser
        files: [
            'public/js/thirdparty/jquery.min.js',
            'public/js/thirdparty/*.js',
            'public/js/app/*.js',
            'public/js/test/BaseSpec.js',
            'public/js/test/specHelper.js',
            'public/js/test/AudioPluginSpec.js',
            'public/js/test/AssetManagerSpec.js',

            'public/js/test/HotspotPluginSpec.js',
            'public/js/test/ContainerPluginSpec.js',
            'public/js/test/TextPluginSpec.js',
            'public/js/test/StageSpec.js',
            'public/js/test/TelemetrySpec.js',
            'public/js/test/VideoPluginSpec.js',
            'public/js/test/MCQPluginSpec.js',
            'public/js/test/MTFPluginSpec.js',
            'public/js/test/RecordManagerSpec.js',
            'public/js/test/WorksheetSpec.js',
            'public/js/test/PluginManagerSpec.js',
            'public/js/test/ShapePluginSpec.js',
            'public/js/test/ScribblePluginSpec.js',
            'public/js/test/AnimationManagerSpec.js',
            'public/js/test/EventManagerSpec.js',
            /*   'public/js/test/ImagePluginSpec.js',*/
            /*'public/js/test/ThemePluginSpec.js',*/
            /* 'public/js/test/OptionPluginSpec.js'
               'public/js/test/StagePluginSpec.js',*/
            /*'public/js/test/DivPluginSpec.js',*/
            /*'public/js/test/DivPluginSpec.js',*/
            /*   'public/js/test/ThemePluginSpec.js',*/
            /* 'public/js/test/AudioManagerSpec.js',
            'public/js/test/CommandManagerSpec.js',
            'public/js/test/GridlayoutPluginSpec.js',*/




        ],


        // list of files to exclude
        exclude: [
            'public/js/app/app.js',
            'public/js/app/services.js',
            'public/js/app/renderer.theme.js',
            'public/js/app/genie-canvas.template.js',
            'public/js/thirdparty/jquery.bookshelfslider.min.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'public/js/app/GlobalContext.js': ['coverage'],
            'public/js/app/renderer.js': ['coverage'],
            'public/js/app/telemetry.js': ['coverage'],
            'public/js/app/speech.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],


        junitReporter: {
            outputDir: 'coverage', // results will be saved as $outputDir/$browserName.xml
            outputFile: 'test-results.xml', // if included, results will be saved as $outputDir/$browserName/$outputFile
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

        // Which plugins to enable
        plugins: [
            "karma-phantomjs-launcher",
            'karma-chrome-launcher',
            "karma-jasmine",
            "karma-jasmine-matchers",
            "karma-junit-reporter",
            'karma-coverage',
            "karma-ng-html2js-preprocessor",
        ],

        // web server port
        port: 8080,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        /* browsers: ['PhantomJS'],*/
        browsers: ['Chrome', 'Chrome_without_security'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    })
}