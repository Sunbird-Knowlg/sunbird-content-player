/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

module.exports = function(config) {
    config.set({
        basePath: '../../../player/',
        frameworks: [
            'jasmine-jquery',
            'jasmine',
            'jasmine-matchers'
        ],
        files: [
            'https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/createjs.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/cordovaaudioplugin-0.6.1.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min.js',
            'www/preview/scripts/renderer.external.min.js',
            'www/preview/scripts/renderer.telemetry.min.js',
            'www/preview/scripts/renderer.script.min.js',
            'public/libs/xml2json.min.js',
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
            { pattern: 'public/test/testContent/items/assessment_mtf.json', watched: false, served: true, included: false },
            { pattern: 'public/test/testContent/assets/assets/public/content/*.mp3', watched: false, served: true, included: false },
            { pattern: 'public/test/testContent/assets/assets/public/content/*.mp4', watched: false, served: true, included: false },
            '../js-libs/renderer/test/spec/beforeAll.js',
            '../js-libs/renderer/test/spec/AnimationPluginSpec.js',
            '../js-libs/renderer/test/spec/AudioPluginSpec.js',
            '../js-libs/renderer/test/spec/ContainerPluginSpec.js',
            '../js-libs/renderer/test/spec/DivPluginSpec.js',
            '../js-libs/renderer/test/spec/EmbedPluginSpec.js',
            '../js-libs/renderer/test/spec/GridLayoutPluginSpec.js',
            '../js-libs/renderer/test/spec/HighlightTextPluginSpec.js',
            '../js-libs/renderer/test/spec/HotspotPluginSpec.js',
            '../js-libs/renderer/test/spec/ImagePluginSpec.js',
            '../js-libs/renderer/test/spec/InputPluginSpec.js',
            '../js-libs/renderer/test/spec/LayoutPluginSpec.js',
            '../js-libs/renderer/test/spec/MCQPluginSpec.js',
            '../js-libs/renderer/test/spec/MTFPluginSpec.js',
            '../js-libs/renderer/test/spec/OptionPluginSpec.js',
            '../js-libs/renderer/test/spec/OptionsPluginSpec.js',
            '../js-libs/renderer/test/spec/PlaceholderPluginSpec.js',
            '../js-libs/renderer/test/spec/ScribblePluginSpec.js',
            '../js-libs/renderer/test/spec/SetPluginSpec.js',
            '../js-libs/renderer/test/spec/ShapePluginSpec.js',
            '../js-libs/renderer/test/spec/StagePluginSpec.js',
            '../js-libs/renderer/test/spec/SummaryPluginSpec.js',
            '../js-libs/renderer/test/spec/TextPluginSpec.js',
            '../js-libs/renderer/test/spec/TimerManagerSpec.js',
            '../js-libs/renderer/test/spec/ThemePluginSpec.js',
            '../js-libs/renderer/test/spec/TweenPluginSpec.js'
            // '../js-libs/renderer/test/spec/VideoPluginSpec.js'
        ],
        exclude: ['coverage'],
        preprocessors: {
            '../js-libs/renderer/plugin/*.js': ['coverage'],
            '../js-libs/renderer/command/*.js': ['coverage'],
            '../js-libs/renderer/manager/*.js': ['coverage'],
            '../js-libs/renderer/controller/*.js': ['coverage'],
            '../js-libs/renderer/evaluator/*.js': ['coverage'],
            '../js-libs/renderer/generator/*.js': ['coverage']
        },
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
        junitReporter: {
            outputDir: '../js-libs/renderer/test/coverage', 
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
        proxies: {
            "/public/coreplugins/": "/base/public/coreplugins/",
            "/assets/sounds/": "/base/public/assets/sounds/",
            "/assets/user_list/": "/base/public/assets/user_list/",
            "/assets/icons/": "/base/public/assets/icons/",
        },
        port: 8080,
        colors: true,
        logLevel: config.LOG_DISABLE,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false,
        browserNoActivityTimeout: 60000,
        client: { captureConsole: false }
    })
}