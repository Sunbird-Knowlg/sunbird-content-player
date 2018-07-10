const path = require('path');
const PLUGIN_PATH = process.env.CE_COREPLUGINS || './plugins';
const webpack = require('webpack');
const glob = require('glob');
const uglifyjs = require('uglify-js');
const expose = require('expose-loader');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const fs = require('fs');
const entryPlus = require('webpack-entry-plus');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');


var corePlugins = [
    "org.ekstep.launcher-1.0",
    "org.ekstep.repo-1.0",
    "org.ekstep.toaster-1.0",
    "org.ekstep.alert-1.0",
    "org.ekstep.telemetrysync-1.0",
    "org.ekstep.overlay-1.0",
    //"org.ekstep.nextnavigation-1.0",
    //"org.ekstep.previousnavigation-1.0"

];

let entryFiles = []

function getEntryFiles() {
    entryFiles = [{
            entryFiles: packagePlugins(),
            outputName: 'coreplugins.js',
        },
        // {
        //     entryFiles: getVendorCSS(),
        //     outputName: 'plugin-vendor',
        // },
    ];
    return entryPlus(entryFiles);
}


function packagePlugins() {
    var pluginPackageArr = []; // Default coreplugin
    //pluginPackageArr.push('./content-editor/scripts/coreplugins.js')
    corePlugins.forEach(function(plugin) {
        var dependenciesArr = [];
        var packagedDepArr = [];
        var manifest = JSON.parse(fs.readFileSync('public/coreplugins/' + plugin + '/manifest.json'));
        var manifestURL = './public/coreplugins/' + plugin + '/manifest.json';
        var pluginContent = fs.readFileSync('public/coreplugins/' + plugin + '/renderer/plugin.js', 'utf8');
        if (fs.existsSync('public/coreplugins/' + plugin + '/renderer/plugin.dist.js')) {
            fs.unlinkSync('public/coreplugins/' + plugin + '/renderer/plugin.dist.js');
        }
        if (manifest.renderer.views && pluginContent) {
            var controllerPathArr = [];
            var templatePathArr = [];
            manifest.renderer.views.forEach(function(obj, i) {
                controllerPathArr[i] = (obj.controller) ? 'require("' + obj.controller + '")' : undefined;
                templatePathArr[i] = (obj.template) ? 'require("' + obj.template + '")' : undefined;
            });
            var count = 0;
            console.log(pluginContent.match(/\b(loadNgModules)\b.*\)/g));

            var len = (pluginContent.replace(/\b(loadNgModules)\b.*\)/g) || []).length;
            pluginContent = uglifyjs.minify(pluginContent.replace(/\b(loadNgModules)\b.*\)/g, function($0) {
                if (count === len) count = 0;
                var dash;
                dash = 'loadNgModules(' + templatePathArr[count] + ' , ' + controllerPathArr[count] + ', true)'
                count++;
                return dash;

            }))

        } else {
            pluginContent = uglifyjs.minify(pluginContent);
        }

        if (manifest.renderer.dependencies) {
            manifest.renderer.dependencies.forEach(function(obj, i) {
                if (obj.type == "js") {
                    dependenciesArr[i] = fs.readFileSync('./public/coreplugins/' + plugin + '/' + obj.src, 'utf8');
                }
            });
        }
        dependenciesArr.push('org.ekstep.pluginframework.pluginManager.registerPlugin(' + JSON.stringify(manifest) + ',' + pluginContent.code.replace(/;\s*$/, "") + ')')

        fs.appendFile('public/coreplugins/' + plugin + '/renderer/plugin.dist.js', [...dependenciesArr].join("\n"))
        pluginPackageArr.push('./public/coreplugins/' + plugin + '/renderer/plugin.dist.js')
    })

    return pluginPackageArr;
}

function getVendorCSS() {
    var cssDependencies = [];
    corePlugins.forEach(function(plugin) {
        var manifest = JSON.parse(fs.readFileSync('public/coreplugins/' + plugin + '/manifest.json'));
        if (manifest.renderer.dependencies) {
            manifest.renderer.dependencies.forEach(function(dep) {
                if (dep.type == "css") {
                    cssDependencies.push('./public/coreplugins/' + plugin + '/' + dep.src)
                }
            })
        };
    })
    return cssDependencies;
}

module.exports = {

    entry: getEntryFiles(),

    output: {
        filename: '[name]',
        path: path.resolve(__dirname, 'public/js'),
    },
    resolve: {
        alias: {
            'jquery': path.resolve('./public/libs/jquery.min.js'),
            //'createjs': path.resolve('./public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/createjs.min.js'),
            //'creatine': path.resolve('./public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min'),
        }
    },
    module: {
        rules: [{
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: [':data-src']
                    }
                }
            },
            {
                test: require.resolve('./public/coreplugins/org.ekstep.telemetrysync-1.0/renderer/libs/md5.js'),
                use: [{
                    loader: 'expose-loader',
                    options: 'CryptoJS'
                }]
            },
            // {
            //     test: require.resolve('./public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/createjs.min.js'),
            //     use: [{
            //         loader: 'expose-loader',
            //         options: 'createjs'
            //     }]
            // },
            // {
            //     test: require.resolve('./public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min'),
            //     use: [{
            //         loader: 'expose-loader',
            //         options: 'creatine'
            //     }]
            // },
            {
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
            }, {
                test: /\.(gif|png|jpe?g|svg)$/,
                use: [
                    'file-loader',
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 50, //it's important
                            outputPath: './images/assets',
                            name: '[name].[ext]',
                        }
                    },
                ],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].min.css",
        }),
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            CryptoJS: path.resolve('./public/coreplugins/org.ekstep.telemetrysync-1.0/renderer/libs/md5.js')
                // createjs: 'createjs',
                // creatine: require.resolve('./public/coreplugins/org.ekstep.ecmlrenderer-1.0/renderer/libs/creatine-1.0.0.min'),
        }),
        // new UglifyJsPlugin({
        //     cache: false,
        //     parallel: true,
        //     uglifyOptions: {
        //         compress: {
        //             dead_code: true,
        //             drop_console: false,
        //             global_defs: {
        //                 DEBUG: true
        //             },
        //             passes: 1,
        //         },
        //         ecma: 5,
        //         mangle: true
        //     },
        //     sourceMap: true
        // }),
    ],
    optimization: {
        minimize: true,
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
        }
    }
};