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
            '../coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/createjs.min.js',
            '../coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/cordovaaudioplugin-0.6.1.min.js',
            '../coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min.js',   
            '../libs/plugin-framework.min.js',
            '../../dist/renderer.external.min.js',
            '../js/basePlugin.js',
            '../js/ekstepRendererApi.js',
            '../../dist/renderer.min.js',
            '../../dist/renderer.script.min.js',
            '../../dist/renderer.telemetry.min.js',
            '../../public/coreplugins/LauncherPlugin.js',
            'spec/*.js',
            '../services/*.js',
            '../js/*.js',
        ],
        exclude: ['coverage'],
        preprocessors: {
            '../*.js': ['coverage'],
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
            'karma-coverage',
            "karma-mocha-reporter"
        ],
        port: 8080,
        colors: true,
        autoWatch: true,
        logLevel:config.LOG_WARN,
        client: {
            captureConsole: false
        }, 
        browsers: ['PhantomJS'],
        singleRun: false,
        browserNoActivityTimeout: 60000
    })
}