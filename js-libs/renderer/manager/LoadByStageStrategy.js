LoadByStageStrategy = Class.extend({
    MAX_CONNECTIONS: 50,
    assetMap: {},
    spriteSheetMap: {},
    commonAssets: [],
    templateAssets: [],
    loaders: {},
    commonLoader: undefined,
    templateLoader: undefined,
    stageManifests: {},
    init: function(data, basePath, cb) {
        //console.info('createjs.CordovaAudioPlugin.isSupported()', createjs.CordovaAudioPlugin.isSupported());
        var instance = this;
        var basePath = basePath;
        createjs.Sound.registerPlugins([createjs.CordovaAudioPlugin, createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
        createjs.Sound.alternateExtensions = ["mp3"];
        this.destroy();
        if (!_.isArray(data.stage)) data.stage = [data.stage];
        var themeData = JSON.parse(JSON.stringify(data));
        if (_.isUndefined(themeData.manifest)) {
            _.each(themeData.stage, function(stage) {
                instance.assignBasePath(stage.manifest, basePath, stage.id)
            })
        } else {
            instance.assignBasePath(themeData.manifest, basePath)
        }
        var stages = themeData.stage;
        if (!_.isArray(stages)) stages = [stages];
        stages.forEach(function(stage) {
            instance.stageManifests[stage.id] = [];
            AssetManager.stageAudios[stage.id] = [];
            instance.populateAssets(stage, stage.id, stage.preload, themeData.startStage, cb);
        });
    },
    assignBasePath: function(manifest, basePath, stageId) {
        var instance = this;
        if (!_.isUndefined(manifest) && !_.isUndefined(manifest.media)) {
            if (!_.isArray(manifest.media)) manifest.media = [manifest.media];
            manifest.media.forEach(function(media) {
                if ((media) && (media.src)) {
                    media.src = (media.src.substring(0, 4) == "http") ? media.src : basePath + media.src;
                    if (createjs.CordovaAudioPlugin.isSupported()) { // Only supported in mobile
                        if (media.type !== 'sound' && media.type !== 'audiosprite') {
                            media.src = 'file:///' + media.src;
                        }
                    }
                    if (media.type == 'spritesheet') {
                        // var imgId = media.id + "_image";
                        // instance.commonAssets.push({
                        //     "id": imgId,
                        //     "src": media.src,
                        //     "type": "image"
                        // });
                        media.images = [];
                        var animations = {};
                        if (media.animations) {
                            for (k in media.animations) {
                                animations[k] = JSON.parse(media.animations[k]);
                            }
                        }
                        media.animations = animations;
                        instance.spriteSheetMap[media.id] = media;
                    } else {
                        if (media.type == 'audiosprite') {
                            if (!_.isArray(media.data.audioSprite)) media.data.audioSprite = [media.data.audioSprite];
                        }
                    }
                    instance.assetMap[media.id] = media
                }
            });
        } else {
            if (!_.isUndefined(stageId))
                console.log("==== stage - " + stageId + " manifest media not defined ====");
            else
                console.log("==== manifest media not defined ====");
        }
    },
    loadCommonAssets: function(stageId, cb) {
        var instance = this;
        this.initializeLoader();
        var commonManifest = [];
        if (stageId && this.stageManifests[stageId].preload) {
            commonManifest = this.stageManifests[stageId]
        }
        var localPath = "undefined" == typeof cordova ? "" : "file:///android_asset/www/";
        commonManifest.push({
            id: "goodjob_sound",
            src: localPath + "assets/sounds/goodjob.mp3"
        });
        commonManifest.push({
            id: "tryagain_sound",
            src: localPath + "assets/sounds/letstryagain.mp3"
        });
        this.loaders.loadManifest(commonManifest, true)
        this.loaders.on('complete', function() {            
            if (cb) {
                // TODO: not a good approach
                instance.loaders.removeAllEventListeners("complete");
                cb();
            }
        })
    },
    populateAssets: function(data, stageId, preload, startStageId, cb) {
        var instance = this;
        for (k in data) {
            var plugins = data[k];
            if (!_.isArray(plugins)) plugins = [plugins];
            if (PluginManager.isPlugin(k) && k == 'g') {
                plugins.forEach(function(plugin) {
                    instance.populateAssets(plugin, stageId, preload, startStageId, cb);
                });
            } else {
                plugins.forEach(function(plugin) {
                    if (plugin && plugin.media) {
                        plugin.media.forEach(function(media) {
                            instance.stageManifests[stageId].push(_.clone(media));
                        })
                    } else
                    if(plugin && plugin.asset){
                        var asset = instance.assetMap[plugin.asset];
                        if (asset) {
                            instance.stageManifests[stageId].push(_.clone(asset));
                        }                        
                    }
                });
            }
        }
        instance.stageManifests[stageId] = _.uniq(instance.stageManifests[stageId], _.property("id"))
        if ((preload === true) && (stageId !== startStageId)) {
            instance.stageManifests[stageId].preload = preload;
        }
        if (_.isEmpty(instance.loaders)) 
            instance.loadCommonAssets(stageId, cb);
    },
    // populateTemplateAssets: function(data) {
    //     var instance = this;
    //     for (k in data) {
    //         var plugins = data[k];
    //         if (!_.isArray(plugins)) plugins = [plugins];
    //         if (PluginManager.isPlugin(k) && k == 'g') {
    //             plugins.forEach(function(plugin) {
    //                 instance.populateTemplateAssets(plugin);
    //             });
    //         } else {
    //             plugins.forEach(function(plugin) {
    //                 if(plugin && plugin.asset){
    //                     var asset = instance.assetMap[plugin.asset];
    //                     if (asset) {
    //                         instance.templateAssets.push(_.clone(asset));
    //                     }
    //                 }
    //             });
    //         }
    //     }
    // },
    getAsset: function(stageId, assetId) {
        var instance = this;
        var asset = undefined;
        if (this.loaders) asset = this.loaders.getResult(assetId, false);
        // if (!asset) asset = this.commonLoader.getResult(assetId);
        // if (!asset) asset = this.templateLoader.getResult(assetId);
        // if (!asset) asset = this.spriteSheetMap[assetId];
        if (!asset) {
            if (this.assetMap[assetId]) {
                // this.loadAsset(stageId, assetId, this.assetMap[assetId].src, function() {
                    // asset = instance.loaders.getResult(assetId);
                    if (!asset) {
                        console.error('Asset not found. Returning - ' + (instance.assetMap[assetId].src) + "----------" + stageId);
                        return instance.assetMap[assetId].src;
                    // } else {
                        // return asset;
                    }
                // })
            } else
                console.error('"' + assetId + '" Asset not found. Please check index.ecml.');
        } else 
            return asset;
    },
    showHideLoader: function(style) {
        var elem = document.getElementById('loaderArea');
        if (!_.isUndefined(elem)) {
            elem.style.display = style;
        }
    },
    initStage: function(stageId, nextStageId, prevStageId, cb) {
        var instance = this;
        this.loadStage(stageId, cb);
        var deleteStages = _.difference(_.keys(instance.stageManifests), [stageId, nextStageId, prevStageId]);
        // var deleteStages = _.difference(_.keys(instance.loaders), [stageId, nextStageId, prevStageId]);
        if (deleteStages.length > 0) {
            deleteStages.forEach(function(stageId) {
                instance.destroyStage(stageId);
            })
        }
        if (nextStageId) {
            instance.loadStage(nextStageId)
        }
        if (prevStageId) {
            instance.loadStage(prevStageId)
        }
        // instance.loaders = _.pick(instance.loaders, stageId, nextStageId, prevStageId);
    },
    initializeLoader : function() {
        var instance = this;
        if (_.isEmpty(instance.loaders)) {
            var loader = this._createLoader();
            loader.setMaxConnections(instance.MAX_CONNECTIONS);
            loader.installPlugin(createjs.Sound);
            loader.on('error', function(evt) {
                console.error('StageLoader Asset preload error', evt);
            });
            instance.loaders = loader;
        }
    },
    loadStage: function(stageId, cb) {
        var instance = this;
        var manifest = instance.stageManifests[stageId];
        if ((_.isUndefined(manifest.progress) || (manifest.progress != "loaded" && manifest.progress != "loading")) && _.isArray(manifest) && manifest.length > 0) {
            // var manifest = JSON.parse(JSON.stringify(instance.stageManifests[stageId]));
            instance.initializeLoader();
            if (instance.loaders.loaded != true) {
                instance.loaders.close();
            }
            instance.loaders.loadManifest(manifest, true);
            instance.loaders.on("complete", function() {
                instance.stageManifests[stageId].progress = "loaded"
                if (cb)
                    cb();
            }, null, true);
            instance.stageManifests[stageId].progress = "loading";
        } else {
            if (cb) {
                cb()
            }
        }
        //         var currentStageLoader = instance.loaders;
        //         // Check if loader for current satge is loaded completely
        //         // if loader for current stage is not loaded, wait for loader to complete and call callback function
        //         if(currentStageLoader.progress < 1) {
        //             currentStageLoader.on("complete", function() {
        //                 cb();
        //             })
        //         } else {
        //             // TODO: Have to remove in future if createjs handle this case.
        //             // Since createjs is not handling loadmanifest when assets is defined multiple times
        //             // so if assets is defined multiple times this value is false
        //             if (currentStageLoader.loaded == false) {
        //                 console.warn("assets are initialized multiple times inside stages")
        //             }
        //             // if loader for current stage is loaded call callback
        //             cb();
        //         }
        //     }
        // }
    },
    // loadCommonAssets: function() {
    //     var loader = this._createLoader();
    //     loader.setMaxConnections(this.MAX_CONNECTIONS);
    //     loader.installPlugin(createjs.Sound);
    //     loader.loadManifest(this.commonAssets, true);
    //     loader.on("error", function(evt) {
    //         console.error("CommonLoader - asset preload error", evt);
    //     });
    //     this.commonLoader = loader;
    // },
    // loadTemplateAssets: function() {
    //     var loader = this._createLoader();
    //     loader.setMaxConnections(this.MAX_CONNECTIONS);
    //     loader.installPlugin(createjs.Sound);
    //     loader.loadManifest(this.templateAssets, true);
    //     loader.on("error", function(evt) {
    //         console.error("TemplateLoader - asset preload error", evt);
    //     });
    //     this.templateLoader = loader;
    // },
    loadAsset: function(stageId, assetId, path, cb) {
        if (_.isUndefined(assetId) || _.isUndefined(path)) {
            console.warn("Asset can't be loaded: AssetId - " + assetId +  ",  Path - " + path);
            return;
        }
        var loader;
        if (!_.isUndefined(this.loaders)) {
            loader = this.loaders;
            // var itemLoaded = loader.getItem(assetId);
            /*if(itemLoaded){
                loader.remove(assetId);
            }*/
            // loader.installPlugin(createjs.Sound);
            loader.on("complete", function() {
                if (cb) {
                    cb();
                }
            }, this);
            loader.loadFile({
                id: assetId,
                src: path
            });
        } else {
            //Image is not intianlised to load, So loading image & adding to the loaders
            loader = this.initializeLoader();
            var instance = this;
            loader.on("complete", function(event) {
                if (_.isUndefined(instance.loaders)) {
                    instance.loaders = {};
                }
                instance.loaders = event.target;
                if (cb) {
                    cb();
                }
            }, this);
            loader.on("error", function(evt) {
                console.error("AssetLoader - asset preload error", evt);
            });
            loader.loadFile({
                id: assetId,
                src: path
            });
        }
    },
    destroy: function() {
        var instance = this;
        for (k in instance.loaders) {
            instance.destroyStage(k);
        }
        instance.assetMap = {};
        instance.loaders = {};
        instance.stageManifests = {};
        try {
            createjs.Sound.removeAllSounds();
        } catch (err) {}
    },
    destroyStage: function(stageId) {
        var instance = this;
        if (instance.loaders && (instance.stageManifests[stageId] && instance.stageManifests[stageId].progress)) {
            delete instance.stageManifests[stageId].progress;
            _.each(instance.stageManifests[stageId], function(media) {
                instance.loaders.remove(media.assetId || media.id);
            })
            // this.loaders[stageId].destroy();
            if (!_.isUndefined(AssetManager.stageAudios[stageId])) {
                AssetManager.stageAudios[stageId].forEach(function(audioAsset) {
                    AudioManager.destroy(stageId, audioAsset);
                });
            }
        }
    },
    _createLoader: function() {
        return "undefined" == typeof cordova ? new createjs.LoadQueue(true, null, true) : new createjs.LoadQueue(false);
    },
    getManifest : function(content) {
        var manifest = {};
        manifest.media = [];
        _.each(content.stage, function(stage) {
            if (!_.isUndefined(stage.manifest && stage.manifest.media)) {
                if (!_.isArray(stage.manifest.media)) stage.manifest.media = [stage.manifest.media];
                _.each(stage.manifest.media, function(media) {
                    manifest.media.push(media)
                })
            }
        })
        return manifest;
    }
});
