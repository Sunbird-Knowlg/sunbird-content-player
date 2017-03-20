// Karma configuration
// Generated on Tue Feb 23 2016 13:39:55 GMT+0530 (IST)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [
            'jasmine-jquery',
            'jasmine',
            'jasmine-matchers'
        ],



        // list of files / patterns to load in the browser
        files: [
            'public/js/thirdparty/jquery.min.js',
            'public/js/thirdparty/*.js',
            'public/js/thirdparty/exclude/xml2json.js',
            'public/js/thirdparty/exclude/createjs-2015.11.26.min.js',
            'public/js/thirdparty/exclude/cordovaaudioplugin-0.6.1.min.js',
            'public/js/thirdparty/exclude/creatine-1.0.0.min.js',
            'public/js/thirdparty/exclude/Class.js',
            'public/libs/ionic/js/ionic.bundle.min.js',
            'public/js/app/AppConfig.js',
            'public/js/app/main.js',
            'public/js/app/*.js',
            'public/js/test/BaseSpec.js',
            'public/js/test/specHelper.js',

            // Manager Test Cases
            'public/js/test/AssetManagerSpec.js',
            'public/js/test/RecordManagerSpec.js',
            'public/js/test/PluginManagerSpec.js',
            'public/js/test/CommandManagerSpec.js',
            'public/js/test/AnimationManagerSpec.js',

            // 'public/js/test/EventManagerSpec.js',


            // 'public/js/test/ImagePluginSpec.js',
            // 'public/js/test/StagePluginSpec.js',

            // Plugin Test Cases
            'public/js/test/TextPluginSpec.js',
            'public/js/test/HotspotPluginSpec.js',
            'public/js/test/ContainerPluginSpec.js',
            'public/js/test/StageSpec.js',
            'public/js/test/MTFPluginSpec.js',
    'public/js/test/ShapePluginSpec.js',
            'public/js/test/ScribblePluginSpec.js',
            'public/js/test/GridlayoutPluginSpec.js',
            'public/js/test/OptionPluginSpec.js',
            'public/js/test/OptionsPluginSpec.js',
            'public/js/test/DivPluginSpec.js',
            'public/js/test/AudioPluginSpec.js',
    'public/js/test/EmbedPluginSpec.js',
            'public/js/test/PlaceholderPluginSpec.js',
            'public/js/test/SetPluginSpec.js',

            'public/js/test/LayoutPluginSpec.js',
            // 'public/js/test/VideoPluginSpec.js', // TODO: Not covered all cases
            'public/js/test/ThemePluginSpec.js', // TODO: Incomplete

    'public/js/test/MCQPluginSpec.js',


            // 'public/js/test/HighlightTextPluginSpec.js',
            // 'public/js/test/PluginSpec.js', // TODO: Incomplete


            // Generator Test Cases

            // Evaluator Test Cases



            // 'public/js/test/AnimationPluginSpec.js',

            // // 'public/js/test/WorksheetSpec.js',





            //




            //  'public/js/test/AudioManagerSpec.js',


            // 'public/js/test/TelemetrySpec.js'




        ],


        // list of files to exclude
        exclude: [
            // 'public/js/app/app.js',
            // 'public/js/app/genieservices.js',
            // 'public/js/app/services.js',
            // 'public/js/app/renderer.theme.js',
            // 'public/js/app/genie-canvas.template.js',
            // 'public/js/thirdparty/jquery.bookshelfslider.min.js'
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            // 'public/js/app/GlobalContext.js': ['coverage'],
            'public/js/app/renderer.js': ['coverage'],
            // 'public/js/app/telemetry.js': ['coverage'],
            // 'public/js/app/speech.js': ['coverage']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['verbose', 'progress', 'coverage'],


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
            "karma-jasmine-jquery",
            "karma-jasmine",
            "karma-jasmine-matchers",
            "karma-junit-reporter",
            'karma-coverage',
            "karma-ng-html2js-preprocessor",
            "karma-verbose-reporter"
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
        browsers: ['PhantomJS'],
        // browsers: ['Chrome', 'Chrome_without_security'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        browserNoActivityTimeout: 600000
    })
}
