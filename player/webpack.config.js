//TODO: Remove the unused constants


const ENVIRONMENT = process.env.NODE_ENV;
const BUILD_NUMBER = process.env.build_number || 1;
const PLAYER_VER = process.env.player_version_number || 1;

// Build Zip Folder Name
const BUILD_FOLDER_NAME = 'player-build';

// Required dependency files
const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const expose = require('expose-loader');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const glob = require('glob-all');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

const APP_CONFIG = {
    ekstep: './public/js/appConfig.js',
    sunbird: './public/js/appConfig-Sunbird.js'
}

const APP_STYLE = [
    './public/styles/ionic.css',
    './public/styles/bookshelf_slider.css',
    './public/styles/skin02.css',
    './public/styles/toastr.min.css',
    './public/styles/jquery.mCustomScrollbar.min.css',
    './public/styles/style.css'
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
    './public/libs/plugin-framework.min.js'
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
    './public/services/localservice.js',
    //'./public/services/webservice.js',
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
];
const TELEMETRY = [
    './public/libs/date-format.js',
    '../js-libs/build/telemetry.js',
    '../js-libs/telemetry/InActiveEvent.js',
    '../js-libs/telemetry/TelemetryEvent.js',
    '../js-libs/telemetry/TelemetryService.js',
    '../js-libs/telemetry/TelemetryServiceUtil.js',
    '../js-libs/telemetry/TelemetryV1Manager.js',
    '../js-libs/telemetry/TelemetryV2Manager.js',
    '../js-libs/telemetry/TelemetryV3Manager.js',
];

// removing the duplicate files
const SCRIPTS = [...new Set([...EXTERNAL_SCRIPTS, ...TELEMETRY, ...APP_SCRIPTS])];

if (!BUILD_NUMBER && !PLAYER_VER) {
    console.error('Error!!! Cannot find player_version_number and build_number env variables');
    return process.exit(1)
}
const VERSION = PLAYER_VER + '.' + BUILD_NUMBER;

module.exports = (env, argv) => {
    (env.platform === 'sunbird') ? SCRIPTS.unshift(APP_CONFIG.sunbird): SCRIPTS.unshift(APP_CONFIG.ekstep);
    console.log("Scripts", SCRIPTS)
    return {
        entry: {
            'script': SCRIPTS,
            "style": APP_STYLE
        },
        output: {
            filename: `[name].min.${VERSION}.js`,
            path: path.resolve(__dirname, 'public/' + BUILD_FOLDER_NAME)
        },
        resolve: {
            alias: {
                'jquery': path.resolve("./public/libs/jquery.min.js"),
                'underscore': path.resolve("./public/libs/underscore.js"),
                'jquery-mousewheel': path.resolve('./node_modules/jquery-mousewheel/jquery.mousewheel.js'),
                'Fingerprint2': path.resolve('../js-libs/telemetry-lib/fingerprint2.min.js'),
            }
        },
        // optimization: {
        //     minimizer: [
        //         new UglifyJsPlugin({
        //             uglifyOptions: {
        //                 compress: {
        //                     drop_console: true,
        //                     warnings: false,
        //                 },
        //                 output: {
        //                     comments: false
        //                 },
        //                 parallel: 4,
        //                 compress: false,
        //                 output: {
        //                     ascii_only: true,
        //                     beautify: false,
        //                     comments: false,
        //                     beautify: false,
        //                     ast: true,
        //                     code: false
        //                 },
        //             }
        //         })
        //     ]
        // },
        module: {
            rules: [{
                    test: /\.(s*)css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: false,
                                minimize: true,
                                "preset": "advanced",
                                discardComments: {
                                    removeAll: true
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf|svg|png)$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: './fonts/',
                            limit: 10000,
                            fallback: 'responsive-loader'
                        }
                    }]
                }, {
                    test: require.resolve('./public/libs/eventbus.min.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'EventBus'
                    }]
                },
                {
                    test: require.resolve('./public/libs/jquery.min.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'jQuery'
                    }]
                },
                {
                    test: require.resolve('./public/libs/jquery.min.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: '$'
                    }]
                },
                {
                    test: require.resolve('./public/libs/underscore.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: '_'
                    }]
                },
                {
                    test: require.resolve('../js-libs/build/telemetry.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'EkTelemetry'
                    }]
                },
                {
                    test: require.resolve('../js-libs/telemetry-lib/fingerprint2.min.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'Fingerprint2'
                    }]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin([path.resolve(__dirname, 'public/' + BUILD_FOLDER_NAME)]),
            new ImageminPlugin({
                test: /\.(jpe?g|png|gif|svg)$/i,
                name: '[name].[ext]',
                outputPath: './images',
                pngquant: {
                    quality: '65-70'
                }
            }),
            new MiniCssExtractPlugin({
                filename: `[name].min.${VERSION}.css`,
            }),
            new ngAnnotatePlugin({
                add: true,
            }),
            new webpack.ProvidePlugin({
                "window.$": "jquery",
                "window._": 'underscore',
                $: 'jquery',
                jQuery: 'jquery',
                _: 'underscore',
                async: "async",
                Fingerprint2: 'Fingerprint2',
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.optimize\.css$/g,
                cssProcessor: require('cssnano'),
                cssProcessorOptions: {
                    safe: true,
                    discardComments: {
                        removeAll: true
                    }
                },
                canPrint: true
            })
        ],
        optimization: {
            splitChunks: {
                chunks: 'async',
                minSize: 30000,
                minChunks: 1,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                automaticNameDelimiter: '~',
                name: true,
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
    }
};