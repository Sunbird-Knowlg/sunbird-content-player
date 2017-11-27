/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 */

module.exports = function(config) {
    config.set({
        basePath: '../../',
        frameworks: [
            'jasmine-jquery',
            'jasmine',
            'jasmine-matchers'
        ],
        files: [{
                pattern: 'http-image/**/*',
                watched: false,
                included: false,
                served: true
            },
            'https://s3.ap-south-1.amazonaws.com/ekstep-public-prod/v3/preview/scripts/renderer.external.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/createjs.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/cordovaaudioplugin-0.6.1.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min.js',
            'www/preview/scripts/renderer.telemetry.min.js',
            'public/js/basePlugin.js',
            'public/js/appConfig.js',
            'public/js/globalContext.js',
            'public/js/appMessages.js',
            'public/js/splashScreen.js',
            'public/js/main.js',
            'public/js/app.js',
            'public/js/basePlugin.js',
            'public/services/mainservice.js',
            'public/services/webservice.js',
            'public/services/interfaceService.js',
            'public/js/ekstepRendererApi.js',
            'public/js/content-renderer.js',
            'public/js/baseLauncher.js',
            'public/js/baseEndpage.js',
            'public/services/controllerservice.js',
            '../js-libs/telemetry-lib/detectClient.js',
            '../js-libs/telemetry-lib/md5.js',
            'public/js/ekstepRendererEvents.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/renderer.min.js',
            'public/coreplugins/**/renderer/*.js',
            'public/test/specs/beforeAll.js',
            'public/test/testContent/widgets/content-plugins/**/renderer/*.js',
            { pattern: 'public/test/testContent/widgets/content-plugins/**/manifest.json', watched: true, served: true, included: false },
            { pattern: 'public/test/testContent/assets/assets/public/content/*.jpeg', watched: true, served: true, included: false },
            { pattern: 'public/test/testContent/assets/assets/public/content/*.png', watched: true, served: true, included: false },
            'public/coreplugins/**/spec/*.spec.js',
            'public/test/specs/*.spec.js',
            // 'public/coreplugins/org.ekstep.ecmlrenderer-1.0/spec/plugin.spec.js',
            { pattern: 'public/coreplugins/**/manifest.json', watched: true, served: true, included: false },
            { pattern: 'public/test/testContent/index.json', watched: true, served: true, included: false }

        ],
        exclude: ['coverage', '../js/htmlInterface.js'], // Need to remove the htmlInterface.js  file
        preprocessors: {
            'public/coreplugins/**/renderer/*.js': ['coverage'],
            'public/js/*.js': ['coverage'],
        },
        reporters: ['mocha', 'coverage'],

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
            outputDir: 'public/test/coverage',
            outputFile: 'test-results.xml',
        },
        coverageReporter: {
            reporters: [{
                type: 'html',
                dir: 'public/test/coverage'
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
            'karma-coverage',
            "karma-mocha-reporter"
        ],
        port: 8080,
        colors: true,
        autoWatch: true,
        logLevel: config.LOG_WARN,
        client: {
            captureConsole: false
        },
        browsers: ['PhantomJS'],
        singleRun: false,
        browserNoActivityTimeout: 60000
    })
}