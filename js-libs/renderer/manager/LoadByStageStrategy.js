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
    init: function(themeData, basePath) {
        //console.info('createjs.CordovaAudioPlugin.isSupported()', createjs.CordovaAudioPlugin.isSupported());
        var instance = this;
        createjs.Sound.registerPlugins([createjs.CordovaAudioPlugin, createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
        createjs.Sound.alternateExtensions = ["mp3"];
        this.destroy();
        this.loadAppAssets();
        if (!_.isUndefined(themeData.manifest.media)) {
            if (!_.isArray(themeData.manifest.media)) themeData.manifest.media = [themeData.manifest.media];

            themeData.manifest.media.forEach(function(media) {
                if ((media) && (media.src)) {
                    media.src = (media.src.substring(0, 4) == "http") ? media.src : basePath + media.src;
                    if (createjs.CordovaAudioPlugin.isSupported()) { // Only supported in mobile
                        if (media.type !== 'sound' && media.type !== 'audiosprite') {
                            media.src = 'file:///' + media.src;
                        }
                    }

                    if (media.type == 'json') {
                        instance.commonAssets.push(_.clone(media));
                    } else if (media.type == 'spritesheet') {
                        var imgId = media.id + "_image";
                        instance.commonAssets.push({
                            "id": imgId,
                            "src": media.src,
                            "type": "image"
                        });
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
                        instance.assetMap[media.id] = media;
                    }
                }
            });
        }else {
          console.log("==== manifest media not defined ====");
        }
        var stages = themeData.stage;
        if (!_.isArray(stages)) stages = [stages];
        stages.forEach(function(stage) {
            instance.stageManifests[stage.id] = [];
            AssetManager.stageAudios[stage.id] = [];
            instance.populateAssets(stage, stage.id, stage.preload, themeData.startStage);
        });
        instance.loadCommonAssets();

        var templates = themeData.template;
        if (!_.isArray(templates)) templates = [templates];
        templates.forEach(function(template) {
            instance.populateTemplateAssets(template);
        });
        instance.loadTemplateAssets();
    },
    loadAppAssets: function() {
        var localPath = "undefined" == typeof cordova ? "" : "file:///android_asset/www/";
        this.commonAssets.push({
            id: "goodjob_sound",
            src: localPath + "assets/sounds/goodjob.mp3"
        });
        this.commonAssets.push({
            id: "tryagain_sound",
            src: localPath + "assets/sounds/letstryagain.mp3"
        });
    },
    populateAssets: function(data, stageId, preload, startStageId) {
        var instance = this;
        for (k in data) {
            var plugins = data[k];
            if (!_.isArray(plugins)) plugins = [plugins];
            if (PluginManager.isPlugin(k) && k == 'g') {
                plugins.forEach(function(plugin) {
                    instance.populateAssets(plugin, stageId, preload);
                });
            } else {
                plugins.forEach(function(plugin) {
                    var asset = instance.assetMap[plugin.asset];
                    if (asset) {
                        if ((preload === true) && (stageId !== startStageId)) {
                            instance.commonAssets.push(_.clone(asset));
                        } else {
                            instance.stageManifests[stageId].push(_.clone(asset));
                        }
                    }
                });
            }
        }
    },
    populateTemplateAssets: function(data) {
        var instance = this;
        for (k in data) {
            var plugins = data[k];
            if (!_.isArray(plugins)) plugins = [plugins];
            if (PluginManager.isPlugin(k) && k == 'g') {
                plugins.forEach(function(plugin) {
                    instance.populateTemplateAssets(plugin);
                });
            } else {
                plugins.forEach(function(plugin) {
                    var asset = instance.assetMap[plugin.asset];
                    if (asset) {
                        instance.templateAssets.push(_.clone(asset));
                    }
                });
            }
        }
    },
    getAsset: function(stageId, assetId) {
        var asset = undefined;
        if (this.loaders[stageId]) asset = this.loaders[stageId].getResult(assetId);
        if (!asset) asset = this.commonLoader.getResult(assetId);
        if (!asset) asset = this.templateLoader.getResult(assetId);
        if (!asset) asset = this.spriteSheetMap[assetId];
        if (!asset) {
            if (this.assetMap[assetId]) {
                console.error('Asset not found. Returning - ' + (this.assetMap[assetId].src));
                return this.assetMap[assetId].src;
            } else
                console.error('"' + assetId + '" Asset not found. Please check index.ecml.');
        };
        return asset;
    },
    initStage: function(stageId, nextStageId, prevStageId, cb) {
        var instance = this;
        this.loadStage(stageId, cb);
        var deleteStages = _.difference(_.keys(instance.loaders), [stageId, nextStageId, prevStageId]);
        if (deleteStages.length > 0) {
            deleteStages.forEach(function(stageId) {
                instance.destroyStage(stageId);
            })
        }
        if (nextStageId) {
            instance.loadStage(nextStageId, function() {
                var plugin = PluginManager.getPluginObject('next');
                if (plugin) {
                    plugin.hide();
                    var nextContainer = PluginManager.getPluginObject('nextContainer');
                    if (nextContainer) {
                        nextContainer.hide();
                    }
                }
                //Overlay.showNext();
            });
        } else {
            //Overlay.showNext();
        }
        if (prevStageId) {
            instance.loadStage(prevStageId, function() {
                var plugin = PluginManager.getPluginObject('previous');
                if (plugin) {
                    plugin.hide();
                    var previousContainer = PluginManager.getPluginObject('previousContainer');
                    if (previousContainer) {
                        previousContainer.hide();
                    }
                }
                //Overlay.showPrevious();
                //enablePrevious();
            });
        }
        instance.loaders = _.pick(instance.loaders, stageId, nextStageId, prevStageId);
    },
    loadStage: function(stageId, cb) {
        var instance = this;
        if (!instance.loaders[stageId]) {
            var manifest = JSON.parse(JSON.stringify(instance.stageManifests[stageId]));
            if (_.isArray(manifest) && manifest.length > 0) {
                var loader = this._createLoader();
                loader.setMaxConnections(instance.MAX_CONNECTIONS);
                if (cb) {
                    loader.on("complete", cb, null, true);
                }
                loader.on('error', function(evt) {
                    console.error('StageLoader Asset preload error', evt);
                });
                loader.installPlugin(createjs.Sound);
                loader.loadManifest(manifest, true);
                instance.loaders[stageId] = loader;
            } else {
                if (cb) {
                    cb();
                }
            }
        } else {
            if (cb) {
                var currentStageLoader = instance.loaders[stageId];
                // Check if loader for current satge is loaded completely
                if (!currentStageLoader.loaded) {
                    // if loader for current stage is not loaded, wait for loader to complete and call callback function
                    currentStageLoader.on("complete", function() {
                        cb();
                    })
                } else {
                    // if loader for current stage is loaded call callback
                    cb();
                }
            }
        }
    },
    loadCommonAssets: function() {
        var loader = this._createLoader();
        loader.setMaxConnections(this.MAX_CONNECTIONS);
        loader.installPlugin(createjs.Sound);
        loader.loadManifest(this.commonAssets, true);
        loader.on("error", function(evt) {
            console.error("CommonLoader - asset preload error", evt);
        });
        this.commonLoader = loader;
    },
    loadTemplateAssets: function() {
        var loader = this._createLoader();
        loader.setMaxConnections(this.MAX_CONNECTIONS);
        loader.installPlugin(createjs.Sound);
        loader.loadManifest(this.templateAssets, true);
        loader.on("error", function(evt) {
            console.error("TemplateLoader - asset preload error", evt);
        });
        this.templateLoader = loader;
    },
    loadAsset: function(stageId, assetId, path, cb) {
        var loader = this.loaders[stageId];
        if (loader) {
            var itemLoaded = loader.getItem(assetId);
            /*if(itemLoaded){
                loader.remove(assetId);
            }*/
            loader.installPlugin(createjs.Sound);
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
            loader = this._createLoader();
            var instance = this;
            loader.on("complete", function(instance, loader) {
                if (_.isUndefined(instance.loaders)) {
                    instance.loaders = {};
                }
                instance.loaders[stageId] = loader;
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
        if (this.loaders[stageId]) {
            this.loaders[stageId].destroy();
            AssetManager.stageAudios[stageId].forEach(function(audioAsset) {
                AudioManager.destroy(stageId, audioAsset);
            });
        }
    },
    _createLoader: function() {
        return "undefined" == typeof cordova ? new createjs.LoadQueue(true, null, true) : new createjs.LoadQueue(false);
    }
});
