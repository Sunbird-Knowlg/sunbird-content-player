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
var GasPlugin = require("gas-webpack-plugin");
//var ngminPlugin = require("ngmin-webpack-plugin");

const WINDOW_OBJECT_EXPLORER = './public/js/webpack.global.variable.js'

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
]

const APP_SCRIPTS = [
    './public/libs/class.js',
    './public/js/AppConfig.js',
    './public/js/globalContext.js',
    './public/js/appMessages.js',
    './public/js/splashScreen.js',
    './public/js/main.js',
    './public/js/app.js',
    './public/js/basePlugin.js',
    './public/services/mainservice.js',
    './public/services/localservice.js',
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
    //'./public/js/webpack.global.variable.js'
]

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
    //'./public/js/webpack.global.variable.js'
]
const APP_FRAMEWORK = [
    './public/libs/xml2json.min.js',
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
    '../js-libs/renderer/command/AnimateCommand.js',
    '../js-libs/renderer/command/BlurCommand.js',
    '../js-libs/renderer/command/CustomCommand.js',
    '../js-libs/renderer/command/DefaultNextCommand.js',
    '../js-libs/renderer/command/EraseCommand.js',
    '../js-libs/renderer/command/EvalCommand.js',
    '../js-libs/renderer/command/EventCommand.js',
    '../js-libs/renderer/command/ExternalCommand.js',
    '../js-libs/renderer/command/ExternalCommand.js',
    '../js-libs/renderer/command/HideCommand.js',
    '../js-libs/renderer/command/HideHTMLElementsCommand.js',
    '../js-libs/renderer/command/PauseCommand.js',
    '../js-libs/renderer/command/PlayCommand.js',
    '../js-libs/renderer/command/ProcessRecordCommand.js',
    '../js-libs/renderer/command/RefreshCommand.js',
    '../js-libs/renderer/command/ReloadCommand.js',
    '../js-libs/renderer/command/ResetCommand.js',
    '../js-libs/renderer/command/SetCommand.js',
    '../js-libs/renderer/command/ShowCommand.js',
    '../js-libs/renderer/command/ShowHTMLElementsCommand.js',
    '../js-libs/renderer/command/StartGenieCommand.js',
    '../js-libs/renderer/command/StartRecordCommand.js',
    '../js-libs/renderer/command/StopCommand.js',
    '../js-libs/renderer/command/TogglePlayCommand.js',
    '../js-libs/renderer/command/ToggleShadowCommand.js',
    '../js-libs/renderer/command/ToggleShowCommand.js',
    '../js-libs/renderer/command/TransitionToCommand.js',
    '../js-libs/renderer/command/UnblurCommand.js',
    '../js-libs/renderer/command/WindowEventCommand.js',
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
    //'./public/js/webpack.global.variable.js'
]


// removing the duplicate files
const SCRIPTS = [...new Set([...EXTERNAL_SCRIPTS, ...TELEMETRY, ...APP_SCRIPTS])];

//SCRIPTS.push(WINDOW_OBJECT_EXPLORER);
//APP_FRAMEWORK.push(WINDOW_OBJECT_EXPLORER);
console.log("App", APP_FRAMEWORK)

if (!BUILD_NUMBER && !PLAYER_VER) {
    console.error('Error!!! Cannot find player_version_number and build_number env variables');
    return process.exit(1)
}
const VERSION = PLAYER_VER + '.' + BUILD_NUMBER;

module.exports = {
    entry: {
        'script': SCRIPTS,
        'renderer': [...new Set(APP_FRAMEWORK)], // Renderer libs only for ECML type contents  
        "style": APP_STYLE
    },
    output: {
        filename: `[name].min.${VERSION}.js`,
        path: path.resolve(__dirname, 'public/' + BUILD_FOLDER_NAME)
    },
    // optimization: {
    //     minimizer: [
    //         new UglifyJsPlugin()
    //     ]
    // },
    resolve: {
        alias: {
            'jquery': path.resolve("./public/libs/jquery.min.js"),
            'underscore': path.resolve("./public/libs/underscore.js"),
            'jquery-mousewheel': path.resolve('./node_modules/jquery-mousewheel/jquery.mousewheel.js'),
            'Fingerprint2': path.resolve('../js-libs/telemetry-lib/fingerprint2.min.js'),
            "X2JS": path.resolve('./public/libs/xml2json.min.js')
        }
    },
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
            },
            {
                test: require.resolve('./public/libs/xml2json.min.js'),
                use: [{
                    loader: 'expose-loader',
                    options: 'X2JS'
                }]
            },
        ]
    },
    plugins: [
        //new CleanWebpackPlugin([path.resolve(__dirname, 'public/' + BUILD_FOLDER_NAME)]),
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
        //new GasPlugin(),
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
            Fingerprint2: 'Fingerprint2'
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
};