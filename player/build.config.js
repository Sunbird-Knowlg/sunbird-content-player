/**
 * @description  Build specific configurations
 * - Currently, Player is having 2 level configurations 🛠  1.Sunbird 2. Ekstep
 * - Plugin Level config 👉 config:{webpack:true/false,(webpack defines Wether plugin should minify using webpack or not) 
 *    package:true/false,(Package defines plugin should bundle with the preview zip/AAR or not) minify:true/false(Minify defines the plugin should not minify using webpack it should just append plugin.js and it's dependencies to coreplugins.js/coreplugins.css)}
 * 
 * @author Manjunath Davanam <manjunathd@ilimi.in>
 * 
 */
module.exports = {
    build_number: process.env.build_number || 1,
    player_ver: process.env.player_version_number || 1,
    filter_plugins: process.env.filter_plugins || 'false',
    minification: {
        drop_console: process.env.drop_console || false,
        mangle: process.env.mangle || false,
    },
    ekstep: {
        configFile: './public/js/appConfig.js',
        splashScreen: {
            backgroundImage: "./public/assets/icons/background_1.png"
        },
        plugins: [{ id: "org.ekstep.overlay", ver: "1.0", config: { package: true, webpack: false } },
            { id: "org.ekstep.userswitcher", ver: "1.0", config: { package: true, webpack: false } },
            { id: "org.ekstep.ecmlrenderer", ver: "1.0", config: { package: false, webpack: false } },
            { id: "org.ekstep.endpage", ver: "1.0", config: { package: true, webpack: false } }
        ],
    },
    sunbird: {
        configFile: './public/js/appConfig-Sunbird.js',
        splashScreen: {
            backgroundImage: "./public/assets/icons/splacebackground_1.png"
        },
        plugins: [
            { id: "org.ekstep.overlay", ver: "1.0", config: { package: true, webpack: false } },
            { id: "org.sunbird.player.userswitcher", ver: "1.0", config: { package: true, webpack: false } },
            { id: "org.ekstep.ecmlrenderer", ver: "1.0", config: { package: false, webpack: false } },
            { id: "org.sunbird.player.endpage", ver: "1.1", config: { package: true, webpack: false } }
        ]
    },
    general: {
        plugins: [
            { id: "org.ekstep.launcher", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.repo", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.toaster", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.alert", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.telemetrysync", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.nextnavigation", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.previousnavigation", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.genie", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.htmlrenderer", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.videorenderer", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.pdfrenderer", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.epubrenderer", ver: "1.0", config: { package: false, webpack: true } },
            { id: "org.ekstep.extcontentpreview", ver: "1.0", config: { package: false, webpack: true } },
        ],
        scripts: {
            external: [
                './public/libs/jquery.min.js',
                './public/libs/jquery.easing.1.3.js',
                './public/libs/jquery.bookshelfslider.min.js',
                './public/libs/async.min.js',
                './public/libs/toastr.min.js',
                './public/libs/jquery.mCustomScrollbar.concat.min.js',
                './public/libs/underscore.js',
                './public/libs/date-format.js',
                './public/libs/ionic.bundle.min.js',
                './public/libs/angular-resource.min.js',
                './public/libs/ng-cordova.min.js',
                './public/libs/ocLazyLoad.js',
                './public/libs/eventbus.min.js',
                './public/libs/plugin-framework.min.js'
            ],
            internal: [
                './public/libs/date-format.js',
                '../js-libs/build/telemetry.min.js',
                '../js-libs/telemetry/InActiveEvent.js',
                '../js-libs/telemetry/TelemetryEvent.js',
                '../js-libs/telemetry/TelemetryService.js',
                '../js-libs/telemetry/TelemetryServiceUtil.js',
                '../js-libs/telemetry/TelemetryV1Manager.js',
                '../js-libs/telemetry/TelemetryV2Manager.js',
                '../js-libs/telemetry/TelemetryV3Manager.js',
                './public/libs/class.js',
                './public/js/globalContext.js',
                './public/js/appMessages.js',
                './public/js/splashScreen.js',
                './public/js/main.js',
                './public/js/app.js',
                './public/js/basePlugin.js',
                './public/services/mainservice.js',
                //'./public/services/localservice.js', // For localdevelopment use localservice.js insted of webservice.js
                './public/services/webservice.js',
                './public/services/interfaceService.js',
                './public/js/ekstepRendererApi.js',
                './public/js/content-renderer.js',
                './public/js/baseLauncher.js',
                './public/js/baseEndpage.js',
                './public/services/controllerservice.js',
                './public/js/ekstepRendererEvents.js',
                './public/js/iEvaluator.js',
                './public/dispatcher/idispatcher.js',
                './public/dispatcher/web-dispatcher.js',
                './public/dispatcher/device-dispatcher.js',
                '../js-libs/renderer/manager/AudioManager.js',
            ]
        },
        styles: {
            external: ['./public/styles/ionic.css',
                './public/styles/bookshelf_slider.css',
                './public/styles/skin02.css',
                './public/styles/toastr.min.css',
                './public/styles/jquery.mCustomScrollbar.min.css',
            ],
            internal: [
                './public/styles/style.css',
                './public/coreplugins-dist/coreplugins.css' // Include the coreplugins.css if have only else comment out this line
            ]
        }
    }
}