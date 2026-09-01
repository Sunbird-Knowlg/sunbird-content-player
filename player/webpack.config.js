/** 
 * @author Manjunath Davanam<manjunathd@ilimi.in>
 * @description    - Which minifies the content-player script files and style files.
 * @example        - CMD to run this file for ekstep channel  👉 [npm run build ekstep]
 *                 - CMD to run this file for sunbird channel 👉 [npm run build sunbird]
 */


const BUILD_NUMBER = process.env.build_number || 1.0;
const PLAYER_VER = process.env.player_version_number || 1.0;
const FILTER_PLUGINS = process.env.filter_plugins || 'false'; // To seperate the plugins for ekstep and sunbird.

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const glob = require('glob-all');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const fs = require('fs');
const replace = require('replace-in-file');
const file_extra = require('fs-extra');
const APP_CONFIG = require('./build.config.js');

const CONSTANTS = {
    build_folder_name: 'player-build',
    ekstep: 'ekstep',
    sunbird: 'sunbird'
};

const FOLDER_PATHS = {
    basePath: './',
    jsLibs: "../js-libs/",
};

const APP_STYLE = [
    './public/styles/ionic.css',
    './public/styles/bookshelf_slider.css',
    './public/styles/skin02.css',
    './public/styles/toastr.min.css',
    './public/styles/jquery.mCustomScrollbar.min.css',
    './public/styles/style.css',
    './public/coreplugins-dist/coreplugins.css' // Include the coreplugins.css if have only else comment out this line
];

const EXTERNAL_SCRIPTS = [
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
    './public/libs/plugin-framework.min.js',
    './public/libs/progressbar.min.js'
];

const APP_SCRIPTS = [
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
    //'./public/services/localView.js', // For localdevelopment use localView.js insted of moblieView.js
    './public/js/mobileView.js',
    './public/dispatcher/idispatcher.js',
    './public/dispatcher/web-dispatcher.js',
    './public/dispatcher/device-dispatcher.js',
    '../js-libs/renderer/manager/AudioManager.js',
];

const TELEMETRY = [
    './public/libs/date-format.js',
    require.resolve('@project-sunbird/telemetry-sdk'),
    '../js-libs/telemetry/InActiveEvent.js',
    '../js-libs/telemetry/TelemetryEvent.js',
    '../js-libs/telemetry/TelemetryService.js',
    '../js-libs/telemetry/TelemetryServiceUtil.js',
    '../js-libs/telemetry/TelemetryV1Manager.js',
    '../js-libs/telemetry/TelemetryV2Manager.js',
    '../js-libs/telemetry/TelemetryV3Manager.js',
];

const SCRIPTS = [...new Set([...EXTERNAL_SCRIPTS, ...TELEMETRY, ...APP_SCRIPTS])];

if (!BUILD_NUMBER && !PLAYER_VER) {
    console.error('Error!!! Cannot find player_version_number and build_number env variables');
    return process.exit(1);
}
const VERSION = PLAYER_VER + '.' + BUILD_NUMBER;

module.exports = (env, argv) => {
    (env.channel === CONSTANTS.sunbird) ? SCRIPTS.unshift(APP_CONFIG.sunbird.configFile) : SCRIPTS.unshift(APP_CONFIG.ekstep.configFile);
    return {
        entry: {
            'script': SCRIPTS,
            "style": APP_STYLE
        },
        output: {
            filename: `[name].min.${VERSION}.js`,
            path: path.resolve(__dirname, 'public/' + CONSTANTS.build_folder_name)
        },
        resolve: {
            alias: {
                'jquery': path.resolve(`${FOLDER_PATHS.basePath}public/libs/jquery.min.js`),
                'underscore': path.resolve(`${FOLDER_PATHS.basePath}public/libs/underscore.js`),
                'jquery-mousewheel': path.resolve(`${FOLDER_PATHS.basePath}node_modules/jquery-mousewheel/jquery.mousewheel.js`),
                'Fingerprint2': path.resolve(`${FOLDER_PATHS.basePath}node_modules/fingerprintjs2/dist/fingerprint2.min.js`),
                'ajv': require.resolve('ajv'),
                'ProgressBar': path.resolve(`${FOLDER_PATHS.basePath}public/libs/progressbar.min.js`),
                'UAParser': path.resolve(`${FOLDER_PATHS.basePath}public/libs/ua-parser.min.js`)
            }
        },
        module: {
            rules: [
                {
                    test: /\.(s*)css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: false
                            }
                        }
                    ]
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf|svg|png)$/,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name][ext]'
                    }
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/eventbus.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: { exposes: ['EventBus'] }
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/jquery.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: { exposes: ['jQuery', '$'] }
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/underscore.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: { exposes: ['_'] }
                    }]
                },
                {
                    test: require.resolve('@project-sunbird/telemetry-sdk'),
                    use: [{
                        loader: 'expose-loader',
                        options: { exposes: ['EkTelemetry'] }
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.basePath}node_modules/fingerprintjs2/dist/fingerprint2.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: { exposes: ['Fingerprint2'] }
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/md5.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: { exposes: ['CryptoJS'] }
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/progressbar.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: { exposes: ['ProgressBar'] }
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/ua-parser.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: { exposes: ['UAParser'] }
                    }]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new MiniCssExtractPlugin({
                filename: `[name].min.${VERSION}.css`,
            }),
            // Replaces on-build-webpack (not compatible with webpack 5)
            {
                apply: (compiler) => {
                    compiler.hooks.afterEmit.tap('AfterBuildPlugin', () => {
                        replaceStringInFiles(env.channel);
                        copyCorePlugins(env.channel);
                    });
                }
            },
            new webpack.ProvidePlugin({
                "window.$": "jquery",
                "window._": 'underscore',
                $: 'jquery',
                jQuery: 'jquery',
                _: 'underscore',
                async: path.resolve(path.join(__dirname, 'public/libs/async.min.js')),
                Fingerprint2: 'Fingerprint2',
                ProgressBar: 'ProgressBar',
                UAParser: 'UAParser'
            }),
        ],
        optimization: {
            minimizer: [
                '...', // keep default TerserPlugin for JS
                new CssMinimizerPlugin()
            ],
            splitChunks: {
                chunks: 'async',
                minSize: 30000,
                minChunks: 1,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                automaticNameDelimiter: '~',
                cacheGroups: {
                    styles: {
                        name: 'style',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: false
                    }
                },
            }
        }
    };
};

function copyCorePlugins(channel) {
    let plugins = [];
    console.log("FILTER_PLUGINS", FILTER_PLUGINS);
    if (FILTER_PLUGINS === 'true') {
        console.log("Plugins are filtering ");
        plugins = (channel === CONSTANTS.sunbird) ? APP_CONFIG.sunbird.plugins : APP_CONFIG.ekstep.plugins;
    } else {
        console.log("Plugins not filtered");
        plugins = [...new Set([...APP_CONFIG.sunbird.plugins, ...APP_CONFIG.ekstep.plugins])];
    }
    console.log("Plugins are ", plugins);
    plugins.forEach(plugin => {
        if (plugin.package) {
            console.log("Plugins moving", plugin);
            const src = `${FOLDER_PATHS.basePath}public/coreplugins/${plugin.id}-${plugin.ver}`;
            const dest = `${FOLDER_PATHS.basePath}public/${CONSTANTS.build_folder_name}/coreplugins/${plugin.id}-${plugin.ver}`;
            fs.cpSync(src, dest, { recursive: true, force: true });
        }
    });
}

function replaceStringInFiles(channel) {
    var replaceTo = (channel === CONSTANTS.sunbird) ? APP_CONFIG.sunbird.splashScreen.backgroundImage : APP_CONFIG.ekstep.splashScreen.backgroundImage;
    const options = [{
        src: "./config.xml",
        files: './config.dist.xml',
        from: /SPLASH_IMAGE_PATH/g,
        to: replaceTo,
    }];
    options.forEach(element => {
        file_extra.copy(element.src, element.files)
            .then(() => {
                replace(element)
                    .then(changes => {
                        console.log('Modified files:', changes.join(', '));
                    })
                    .catch(error => {
                        console.error('Error occurred:', error);
                    });
            })
            .catch(err => {
                console.error("Error occurred", err);
            });
    });
}
