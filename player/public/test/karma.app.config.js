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
        files: [
            {pattern: 'http-image/**/*', watched: false, included: false, served: true },
            'https://s3.ap-south-1.amazonaws.com/ekstep-public-prod/v3/preview/scripts/renderer.external.min.js',
            '../coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/createjs.min.js',
            '../coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/cordovaaudioplugin-0.6.1.min.js',
            '../coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min.js',
            //'https://s3.ap-south-1.amazonaws.com/ekstep-public-prod/v3/preview/scripts/renderer.script.min.js',
           // '../services/*.js',
            // '../js/baseLauncher.js',
            //'../../www/preview/scripts/renderer.script.min.js',
            '../../www/preview/scripts/renderer.telemetry.min.js',
            '../js/basePlugin.js',

            //'../js/*.js',
            //'../js/baseLauncher.js',
                    '../js/appConfig.js',
                    '../js/globalContext.js',
                    '../js/appMessages.js',
                    '../js/splashScreen.js',
                    '../js/main.js',
                    '../js/app.js',
                    '../js/basePlugin.js',
                    '../services/mainservice.js',
                    '../services/webservice.js',
                    '../services/interfaceService.js',
                    '../js/ekstepRendererApi.js',
                    '../js/content-renderer.js',
                    '../js/baseLauncher.js',
                    '../js/baseEndpage.js',
                    '../services/controllerservice.js',
                    '../js/detectClient.js',
                    '../js/ekstepRendererEvents.js',
            'https://s3.ap-south-1.amazonaws.com/ekstep-public-prod/v3/preview/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/renderer.min.js',
            '../coreplugins/**/renderer/*.js',
            //'../coreplugins/**/renderer/**/*.js', // for angular controllers inside core 
            //'../js/appConfig.js',
            //'../js/basePlugin.js',
            //'../js/ekstepRendererApi.js',
            '../coreplugins/**/spec/*.js',
            //'../js/*.js',
            'specs/*.spec.js',
            
        ],
        exclude: ['coverage','../js/htmlInterface.js'], // Need to remove the htmlInterface.js  file
        preprocessors: {
            '../coreplugins/**/renderer/*.js': ['coverage'],
            '../js/*.js': ['coverage'],
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