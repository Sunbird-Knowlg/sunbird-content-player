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
    init: function(data, basePath) {
        //console.info('createjs.CordovaAudioPlugin.isSupported()', createjs.CordovaAudioPlugin.isSupported());
        var instance = this;
        createjs.Sound.registerPlugins([createjs.CordovaAudioPlugin, createjs.WebAudioPlugin, createjs.HTMLAudioPlugin]);
        createjs.Sound.alternateExtensions = ["mp3"];
        this.destroy();
        this.loadAppAssets();
        var themeData = JSON.parse(JSON.stringify(data));
        if (!_.isUndefined(themeData.manifest)) {
            instance.assignBasePath(themeData.manifest, basePath)
        }
        if (!_.isArray(themeData.stage)) themeData.stage = [themeData.stage];
        _.each(themeData.stage, function(stage) {
            if (!_.isUndefined(stage.manifest)) {
                instance.assignBasePath(stage.manifest, basePath, stage.id)
            }
        })
        themeData.stage.forEach(function(stage) {
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
    assignBasePath: function(manifest, basePath, stageId) {
        if (!_.isUndefined(manifest.media)) {
            if (!_.isArray(manifest.media)) manifest.media = [manifest.media];
            var instance = this;
            manifest.media.forEach(function(media) {
                if ((media) && (media.src)) {
                    media.src = (media.src.substring(0, 4) == "http") ? media.src : basePath + media.src;
                    if (createjs.CordovaAudioPlugin.isSupported()) { // Only supported in mobile
                        if (media.type !== 'sound' && media.type !== 'audiosprite') {
                            media.src = 'file:///' + media.src;
                        }
                    }

                    if (media.type == 'json' && _.isUndefined(stageId)) {
                        instance.commonAssets.push(_.clone(media));
                    } else if (media.type == 'spritesheet') {
                        if (_.isUndefined(stageId)) {
                            var imgId = media.id + "_image";
                            instance.commonAssets.push({
                                "id": imgId,
                                "src": media.src,
                                "type": "image"
                            });
                        }
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
                        if (_.isUndefined(stageId) && ((media.preload === 'true') || (media.preload === true))) {
                            instance.commonAssets.push(_.clone(media));
                        }
                        instance.assetMap[media.id] = media;
                    }
                }
            });
        } else {
            if (!_.isUndefined(stageId))
                console.log("==== stage - " + stageId + " manifest media not defined ====");
            else
                console.log("==== manifest media not defined ====");
        }
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
                    instance.populateAssets(plugin, stageId, preload, startStageId);
                });
            } else {
                plugins.forEach(function(plugin) {
                    if(plugin && (plugin.asset || plugin.audio)){
                        var asset = instance.assetMap[plugin.asset || plugin.audio];
                        if (asset) {
                            if ((preload === true) && (stageId !== startStageId)) {
                                instance.commonAssets.push(_.clone(asset));
                            } else {
                                instance.stageManifests[stageId].push(_.clone(asset));
                            }
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
                    if(plugin && plugin.asset){
                        var asset = instance.assetMap[plugin.asset];
                        if (asset) {
                            instance.templateAssets.push(_.clone(asset));
                        }
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
            instance.loadStage(nextStageId)
        }
        if (prevStageId) {
            instance.loadStage(prevStageId)
        }
        instance.loaders = _.pick(instance.loaders, stageId, nextStageId, prevStageId);
    },
    loadStage: function(stageId, callback) {
        var instance = this;
        if (!instance.loaders[stageId]) {
            var mediaList = JSON.parse(JSON.stringify(instance.stageManifests[stageId]));
            mediaList = _.uniq(mediaList, function(media) {
                return media.assetId || media.id;
            })
            if (_.isArray(mediaList) && mediaList.length > 0) {
                var loader = this._createLoader();
                loader.setMaxConnections(instance.MAX_CONNECTIONS);
                loader.on('error', function(evt) {
                    console.error('StageLoader Asset preload error', evt);
                });
                loader.installPlugin(createjs.Sound);
                loader.loadManifest(mediaList, true);
                instance.loaders[stageId] = loader;
            }
        }
        this.handleStageCallback(stageId, callback);
    },
    handleStageCallback: function(stageId, cb) {
        if (cb) {
            if (!_.isUndefined(this.loaders[stageId]) && (this.loaders[stageId].progress < 1 || this.loaders[stageId].loaded == false)) {
                this.loaders[stageId].on("complete", function() {
                    var data = Renderer.theme && Renderer.theme._currentStage ? Renderer.theme._currentStage : stageId;
                    if (stageId == data) {
                        EventBus.dispatch(data + '_assetsLoaded');
                        cb();
                    }
                }, null, true);
            } else {
                var data = Renderer.theme && Renderer.theme._currentStage ? Renderer.theme._currentStage : stageId;
                if (stageId == data) {
                    EventBus.dispatch(data + '_assetsLoaded');
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
        if (_.isUndefined(assetId) || _.isUndefined(path)) {
            console.warn("Asset can't be loaded: AssetId - " + assetId +  ",  Path - " + path);
            return;
        }
        var loader = this.loaders[stageId];
        if (loader) {
            // var itemLoaded = loader.getItem(assetId);
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
            loader.on("complete", function(event) {
                if (_.isUndefined(instance.loaders)) {
                    instance.loaders = {};
                }
                instance.loaders[stageId] = event.target;
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
    },
    isStageAssetsLoaded : function(stageId) {
        // Show weather stage manifest are loaded or not.
        var manifest = JSON.parse(JSON.stringify(this.stageManifests[stageId]));
        if (!_.isUndefined(this.loaders[stageId]) && this.loaders[stageId].progress >= 1) {
            return true
        } else
        if (_.isArray(manifest) && manifest.length == 0) {
            return true
        }
        return false
    }
});
