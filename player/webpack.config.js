//TODO: Remove the unused constants


const ENVIRONMENT = process.env.NODE_ENV;
const BUILD_NUMBER = process.env.build_number || 1;
const EDITOR_VER = process.env.editor_version_number || 1;
const PLUGIN_FRAMEWORK_VER = process.env.framework_version_number || 1;

const BUILD_FOLDER_NAME = 'player.zip';

const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const expose = require('expose-loader');
const BowerResolvePlugin = require("bower-resolve-webpack-plugin");
const UglifyJS = require("uglify-es");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PurifyCSSPlugin = require('purifycss-webpack');
const glob = require('glob-all');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const FontminPlugin = require('fontmin-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const CompressionPlugin = require("compression-webpack-plugin")
const BrotliGzipPlugin = require('brotli-gzip-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const CleanWebpackPlugin = require('clean-webpack-plugin');

/** 
 *  Core plugins file path, Refer minified file which is already created form the gulp.
 */
const CORE_PLUGINS = './app/scripts/coreplugins.js';

const APP_STYLE = [
    './public/styles/ionic.css',
    './public/lstyles/bookshelf_slider.css',
    //'./public/styles/skin02.css',
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
    './public/libs/plugin-framework.min.js'
]

const APP_SCRIPTS = [
    '././public/js/globalContext.js',
    './public/js/appMessages.js',
    './public/js/splashScreen.js',
    './public/js/main.js',
    './public/js/app.js',
    './public/js/basePlugin.js',
    './public/services/mainservice.js',
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
    './public/dispatcher/device-dispatcher.js'
]

const TELEMETRY = [
        './public/libs/class.js',
        './public/libs/date-format.js',
        '../js-libs/build/telemetry.js',
        '../js-libs/telemetry/InActiveEvent.js',
        '../js-libs/telemetry/TelemetryEvent.js',
        '../js-libs/telemetry/TelemetryService.js',
        '../js-libs/telemetry/TelemetryServiceUtil.js',
        '../js-libs/telemetry/TelemetryV1Manager.js',
        '../js-libs/telemetry/TelemetryV2Manager.js',
        '../js-libs/telemetry/TelemetryV3Manager.js'
    ]
    // getRendererFrameworkFiles = function() {
    //     var fs = require('fs'),
    //         entries = fs.readdirSync('../js-libs/renderer/**/').filter(function(file) {
    //             return file.match(/.*\.js$/);
    //         });
    //     console.log("entries", entries);
    // }
    //getRendererFrameworkFiles();
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
    //'../js-libs/renderer/command/*.js',
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
    '../js-libs/speech/speech.js'
]

// removing the duplicate files
const SCRIPTS = [...new Set([...EXTERNAL_SCRIPTS, ...TELEMETRY, ...APP_SCRIPTS])]

if (!BUILD_NUMBER && !EDITOR_VER && !PLUGIN_FRAMEWORK_VER) {
    console.error('Error!!! Cannot find framework_version_number, editor_version_number and build_number env variables');
    return process.exit(1)
}
const VERSION = EDITOR_VER + '.' + BUILD_NUMBER;

module.exports = {
    entry: {
        'script': SCRIPTS,
        'renderer': [...new Set(APP_FRAMEWORK)]
            //"style": APP_STYLE
    },
    output: {
        filename: `[name].min.${VERSION}.js`,
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        alias: {
            'jquery': path.resolve("./public/libs/jquery.min.js"),
            'jquery-mousewheel': path.resolve('./node_modules/jquery-mousewheel/jquery.mousewheel.js'),
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
                    },
                    {
                        loader: 'sass-loader',
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
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    'file-loader',
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 50, //it's important
                            outputPath: './images',
                            name: '[name].[ext]',
                        }
                    },
                ],
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
            },
        ]
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new UglifyJsPlugin({
            cache: false,
            parallel: true,
            uglifyOptions: {
                compress: {
                    dead_code: true,
                    drop_console: true,
                    global_defs: {
                        DEBUG: true
                    },
                    passes: 1,
                },
                ecma: 6,
                mangle: true
            },
            sourceMap: true
        }),
        // copy the index.html and templated to eidtor filder
        // new CopyWebpackPlugin([{
        //     from: './app/index.html',
        //     to: './[name].[ext]',
        //     toType: 'template'
        // }]),
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
        new webpack.ProvidePlugin({}),
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
        }),
        new ZipPlugin({
            path: path.join(__dirname, '.'),
            filename: BUILD_FOLDER_NAME,
            fileOptions: {
                mtime: new Date(),
                mode: 0o100664,
                compress: true,
                forceZip64Format: false,
            },
            pathMapper: function(assetPath) {
                console.log("AssesPath", assetPath)
                if (assetPath.startsWith('gulpfile')) {
                    return path.join('.', path.basename(assetPath));
                }
                if (assetPath.endsWith('.js'))
                    return path.join(path.dirname(assetPath), 'scripts', path.basename(assetPath));
                if (assetPath.endsWith('.css'))
                    return path.join(path.dirname(assetPath), 'styles', path.basename(assetPath));
                if (assetPath.startsWith('fonts')) {
                    return path.join('styles', 'fonts', path.basename(assetPath));
                };
                return assetPath;
            },
            exclude: [`style.min.${VERSION}.js`],
            zipOptions: {
                forceZip64Format: false,
            },
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