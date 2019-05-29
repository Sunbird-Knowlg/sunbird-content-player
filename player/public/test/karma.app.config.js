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
            'https://cdn.jsdelivr.net/npm/promise-polyfill@7/dist/polyfill.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/createjs.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/cordovaaudioplugin-0.6.1.min.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min.js',
            'public/libs/md5.js',
            'www/preview/script.min.*.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/renderer.min.js',
            { pattern: 'public/assets/user_list/user_list.json', watched: true, served: true, included: false },
            'public/coreplugins/**/renderer/*.js',
            'public/test/specs/beforeAll.js',
            'public/test/testContent/widgets/content-plugins/**/renderer/*.js',
            { pattern: 'public/test/testContent/widgets/content-plugins/**/manifest.json', watched: true, served: true, included: false },
            { pattern: 'public/test/testContent/assets/assets/public/content/*.jpeg', watched: true, served: true, included: false },
            { pattern: 'public/test/testContent/assets/assets/public/content/*.png', watched: true, served: true, included: false },
            { pattern: 'public/test/testContent/index.html', watched: true, served: true, included: false },
            'public/coreplugins/**/spec/*.spec.js',
            'public/test/specs/*.spec.js',
            // 'public/coreplugins/org.ekstep.htmlrenderer-1.0/spec/plugin.spec.js',
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