/**
 * @author Manjunath Davanam <manjunathd@ilimi.in>
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
            //TODO: Need to use hosted files path    
            '../../../../player/public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/createjs.min.js',
            '../../../../player/public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/cordovaaudioplugin-0.6.1.min.js',
            '../../../../player/public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min.js',
            '../../../../player/dist/renderer.external.min.js',
            '../../../../player/public/js/basePlugin.js',
            '../../../../player/public/js/ekstepRendererApi.js',
            '../../../../player/dist/renderer.min.js',
            '../../../../player/dist/renderer.script.min.js',
            '../../../../player/dist/renderer.telemetry.min.js',
            'spec/*PluginSpec.js',
            '../*Plugin.js'
        ],
        exclude: ['coverage'],
        preprocessors: {
            '../*Plugin.js': ['coverage'],
        },
        reporters: ['verbose', 'progress', 'coverage'],      
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
        port: 8080,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        client: {captureConsole: false }, 
        browsers: ['PhantomJS'],
        singleRun: false,
        browserNoActivityTimeout: 60000
    })
}