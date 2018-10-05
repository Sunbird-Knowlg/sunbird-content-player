/** 
 * @author Manjunath Davanam<manjunathd@ilimi.in>
 * @description    - Which minifies the content-player script files and style files.
 * @example        - CMD to run this file for ekstep channel  👉 [npm run build ekstep]
 *                 - CMD to run this file for sunbird channel 👉 [npm run build sunbird]
 */

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
const fs = require('fs');
const replace = require('replace-in-file');
const file_extra = require('fs-extra')
var WebpackOnBuildPlugin = require('on-build-webpack');
const APP_CONFIG = require('./build.config.js')

const CONSTANTS = {
    build_folder_name: 'player-build',
    ekstep: 'ekstep',
    sunbird: 'sunbird'
};

const FOLDER_PATHS = {
    basePath: './',
    jsLibs: "../js-libs/",

};

// removing the duplicate files
const SCRIPTS = [...new Set([...APP_CONFIG.general.scripts.external, ...APP_CONFIG.general.scripts.internal])];
const STYLES = [...new Set([...APP_CONFIG.general.styles.external, ...APP_CONFIG.general.styles.internal])];

if (!APP_CONFIG.build_number && !APP_CONFIG.player_ver) {
    console.error('Error!!! Cannot find player_version_number and build_number env variables');
    return process.exit(1)
}
const VERSION = APP_CONFIG.player_ver + '.' + APP_CONFIG.build_number;

module.exports = (env, argv) => {
    (env.channel === CONSTANTS.sunbird) ? SCRIPTS.unshift(APP_CONFIG.sunbird.configFile): SCRIPTS.unshift(APP_CONFIG.ekstep.configFile);
    return {
        entry: {
            'script': SCRIPTS,
            "style": STYLES
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
                'Fingerprint2': path.resolve(`${FOLDER_PATHS.jsLibs}telemetry-lib/fingerprint2.min.js`),
                'ajv': require.resolve(`${FOLDER_PATHS.basePath}node_modules/ajv/dist/ajv.min.js`)
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
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/eventbus.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: 'EventBus'
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/jquery.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: 'jQuery'
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/jquery.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: '$'
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/underscore.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: '_'
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.jsLibs}build/telemetry.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: 'EkTelemetry'
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.jsLibs}telemetry-lib/fingerprint2.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: 'Fingerprint2'
                    }]
                },
                {
                    test: require.resolve('../js-libs/telemetry-lib/md5.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'CryptoJS'
                    }]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin([path.resolve(__dirname, 'public/' + CONSTANTS.build_folder_name)]),
            new MiniCssExtractPlugin({
                filename: `[name].min.${VERSION}.css`,
                chunkFilename: "[id].css"
            }),
            new WebpackOnBuildPlugin(function(stats) {
                replaceStringInFiles(env.channel);
                copyCorePlugins(env.channel);
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

function copyCorePlugins(channel) {
    let plugins = [];
    console.log("FILTER_PLUGINS", APP_CONFIG.filter_plugins)
    if (APP_CONFIG.filter_plugins === 'true') {
        console.log("Plugins are filtering ")
        plugins = (channel === CONSTANTS.sunbird) ? APP_CONFIG.sunbird.plugins : APP_CONFIG.ekstep.plugins;
    } else {
        console.log("Plugins not filtered")
        plugins = [...new Set([...APP_CONFIG.sunbird.plugins, ...APP_CONFIG.ekstep.plugins])]
    }
    console.log("Plugins are ", plugins);
    plugins.forEach(plugin => {
        if (plugin.config.package) {
            console.log("Plugins moving", plugin);
            file_extra.copy(`${FOLDER_PATHS.basePath}/public/coreplugins/${plugin.id}-${plugin.ver}`, `${FOLDER_PATHS.basePath}/public/${CONSTANTS.build_folder_name}/coreplugins/${plugin.id}-${plugin.ver}/`)
        }
    })
};

function replaceStringInFiles(channel) {
    // Which is used to replace the specific string from the mentioned file 
    var replaceTo = (channel === CONSTANTS.sunbird) ? APP_CONFIG.sunbird.splashScreen.backgroundImage : APP_CONFIG.ekstep.splashScreen.backgroundImage
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
                console.error("Error occurred", err)
            })
    });
}