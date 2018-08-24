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
            'https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/createjs.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/cordovaaudioplugin-0.6.1.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min.js',
            'www/preview/script.min.*.js',
            '../js-libs/renderer/manager/PluginManager.js',
            '../js-libs/renderer/manager/ControllerManager.js',
            '../js-libs/renderer/manager/AudioManager.js',
            '../js-libs/renderer/controller/Controller.js',
            '../js-libs/renderer/controller/DataController.js',
            '../js-libs/renderer/controller/ItemController.js',
            '../js-libs/renderer/evaluator/ChoiceEvaluator.js',
            '../js-libs/renderer/evaluator/FTBEvaluator.js',
            '../js-libs/renderer/evaluator/MTFEvaluator.js',
            '../js-libs/renderer/manager/AnimationManager.js',
            '../js-libs/renderer/manager/AssetManager.js',
            '../js-libs/renderer/manager/CommandManager.js',
            '../js-libs/renderer/manager/EventManager.js',
            '../js-libs/renderer/manager/OverlayManager.js',
            '../js-libs/renderer/manager/LoadByStageStrategy.js',
            '../js-libs/renderer/manager/RecorderManager.js',
            '../js-libs/renderer/manager/TimerManager.js',
            '../js-libs/renderer/generator/DataGenerator.js',
            '../js-libs/renderer/generator/ItemDataGenerator.js',
            '../js-libs/renderer/command/Command.js',
            '../js-libs/renderer/command/*.js',
            '../js-libs/renderer/plugin/HTMLPlugin.js',
            '../js-libs/renderer/plugin/AnimationPlugin.js',
            '../js-libs/renderer/plugin/LayoutPlugin.js',
            '../js-libs/renderer/plugin/ShapePlugin.js',
            '../js-libs/renderer/plugin/AudioPlugin.js',
            '../js-libs/renderer/plugin/ContainerPlugin.js',
            '../js-libs/renderer/plugin/DivPlugin.js',
            '../js-libs/renderer/plugin/EmbedPlugin.js',
            '../js-libs/renderer/plugin/HotspotPlugin.js',
            '../js-libs/renderer/plugin/ImagePlugin.js',
            '../js-libs/renderer/plugin/InputPlugin.js',
            '../js-libs/renderer/plugin/MCQPlugin.js',
            '../js-libs/renderer/plugin/MTFPlugin.js',
            '../js-libs/renderer/plugin/OptionPlugin.js',
            '../js-libs/renderer/plugin/OptionsPlugin.js',
            '../js-libs/renderer/plugin/PlaceHolderPlugin.js',
            '../js-libs/renderer/plugin/SetPlugin.js',
            '../js-libs/renderer/plugin/SpritePlugin.js',
            '../js-libs/renderer/plugin/StagePlugin.js',
            '../js-libs/renderer/plugin/SummaryPlugin.js',
            '../js-libs/renderer/plugin/TextPlugin.js',
            '../js-libs/renderer/plugin/ThemePlugin.js',
            '../js-libs/renderer/plugin/TweenPlugin.js',
            '../js-libs/renderer/plugin/ScribblePlugin.js',
            '../js-libs/renderer/plugin/VideoPlugin.js',
            '../js-libs/renderer/plugin/GridlayoutPlugin.js',
            '../js-libs/renderer/plugin/HighlightTextPlugin.js',
            '../js-libs/speech/android-recorder.js',
            '../js-libs/speech/speech.js',
            { pattern: 'public/coreplugins/org.ekstep.ecmlrenderer-1.0/manifest.json', watched: false, served: true, included: false },
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/plugin.js',
            { pattern: 'public/assets/sounds/*.mp3', watched: false, served: true, included: false },
            { pattern: 'public/assets/icons/*.png', watched: false, served: true, included: false },
            { pattern: 'public/test/testContent/assets/assets/public/content/*.jpg', watched: false, served: true, included: false },
            { pattern: 'public/test/testContent/assets/assets/public/content/*.png', watched: false, served: true, included: false },
            { pattern: 'public/test/testContent/assets/assets/public/content/spriteAnimation.json', watched: false, served: true, included: false },
            { pattern: 'public/test/testContent/items/assessment_mtf.json', watched: false, served: true, included: false },
            { pattern: 'public/test/testContent/assets/assets/public/content/*.mp3', watched: false, served: true, included: false },
            { pattern: 'public/test/testContent/assets/assets/public/content/*.mp4', watched: false, served: true, included: false },
            '../js-libs/renderer/test/spec/dom_simulation.js',
            '../js-libs/renderer/test/spec/plugin/AnimationPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/AudioPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/ContainerPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/DivPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/EmbedPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/GridLayoutPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/HighlightTextPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/HotspotPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/ImagePluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/InputPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/LayoutPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/MCQPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/MTFPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/OptionPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/OptionsPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/PlaceholderPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/ScribblePluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/SetPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/ShapePluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/SpritePluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/StagePluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/SummaryPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/TextPluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/TimerManagerSpec.js',
            '../js-libs/renderer/test/spec/plugin/ThemePluginSpec.js',
            '../js-libs/renderer/test/spec/plugin/TweenPluginSpec.js',
            // '../js-libs/renderer/test/spec/plugin/VideoPluginSpec.js',
            '../js-libs/renderer/test/spec/command/AllCommandSpec.js',
            '../js-libs/renderer/test/spec/command/CommandSpec.js'
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
            '../js-libs/renderer/!(test)/*.js': ['coverage']
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
                { type: 'html', dir: 'coverage/' },
                { type: 'text-summary' },
                { type: 'cobertura' }
            ]
        },

        proxies: {
            "/public/coreplugins/": "/base/public/coreplugins/",
            "/assets/sounds/": "/base/public/assets/sounds/",
            "/assets/user_list/": "/base/public/assets/user_list/",
            "/assets/icons/": "/base/public/assets/icons/",
        },

        browserNoActivityTimeout: 60000
    })
}