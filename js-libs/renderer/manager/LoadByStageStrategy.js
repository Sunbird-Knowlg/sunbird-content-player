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
        createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.CordovaAudioPlugin, createjs.HTMLAudioPlugin]);
        createjs.Sound.alternateExtensions = ["mp3"];
        this.destroy();
        this.loadAppAssets();

        if (!_.isUndefined(themeData.manifest) && !_.isUndefined(themeData.manifest.media)) {
            if (!_.isArray(themeData.manifest.media)) themeData.manifest.media = [themeData.manifest.media];

            themeData.manifest.media.forEach(function(media) {
                if ((media) && (media.src)) {
                    if (media.src.substring(0, 4) != 'http') {
                        if (isbrowserpreview) {
                            var globalConfig = EkstepRendererAPI.getGlobalConfig();
                            media.src = globalConfig.host + media.src;
                        } else {
                            media.src = basePath + media.src;
                        }
                    }
                    // if (createjs.CordovaAudioPlugin.isSupported()) { // Only supported in mobile
                    //     if (media.type !== 'sound' && media.type !== 'audiosprite' && !regex.test(media.src)) {
                    //         media.src = 'file:///' + media.src;
                    //     }
                    // }
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
                        if ((media.preload === 'true') || (media.preload === true)) {
                            instance.commonAssets.push(_.clone(media));
                        }
                        instance.assetMap[media.id] = media;
                    }
                }
            });
        } else {
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
            if ((PluginManager.isPlugin(k) && k == 'g') || k == "manifest") {
                plugins.forEach(function(plugin) {
                    instance.populateAssets(plugin, stageId, preload, startStageId);
                });
            } else {
                plugins.forEach(function(plugin) {
                    if (!_.isNull(plugin)) {
                        var assetId = plugin.asset || plugin.audio || plugin.assetId
                        if(assetId){
                            var asset = instance.assetMap[assetId];
                            if (asset) {
                                if ((preload === true) && (stageId !== startStageId)) {
                                    instance.commonAssets.push(_.clone(asset));
                                }
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
            EkstepRendererAPI.logErrorEvent({'message':'Asset not found. Please check index.ecml'},{'type':'content','severity':'error','action':'play', 'asset':assetId, 'objectId':assetId})
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
        var currentStageId =  Renderer.theme._currentStage;
        console.log("curentStageID", currentStageId);
        if (!instance.loaders[stageId]) {
            var mediaList = JSON.parse(JSON.stringify(instance.stageManifests[stageId]));
            mediaList = _.uniq(mediaList, function(media) {
                return media.assetId || media.id;
            });
            mediaList = instance.filterMedia(mediaList, "video");
            if (_.isArray(mediaList) && mediaList.length > 0) {
                var loader = this._createLoader();
                instance.loaderWithPercentage(stageId, loader);
                loader.stageLoaded = false;
                loader.on("complete", function() {
                    loader.stageLoaded = true;
                }, null, true);
                loader.on('error', function(evt) {
                    console.error('StageLoader Asset preload error', evt);
                });
                loader.setMaxConnections(instance.MAX_CONNECTIONS);
                loader.installPlugin(createjs.Sound);
                loader.loadManifest(mediaList, true);
                instance.loaders[stageId] = loader;
            }
        } else {
            var stgLoader = instance.loaders[stageId];
            instance.loaderWithPercentage(stageId, stgLoader);
        }
        this.handleStageCallback(stageId, callback);
    },
    handleStageCallback: function(stageId, cb) {
        var instance = this;
        if (cb) {
            if (!_.isUndefined(this.loaders[stageId]) && !this.loaders[stageId].stageLoaded) {
                this.loaders[stageId].on("complete", function() {
                    instance.loaders[stageId].stageLoaded = true;
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
    filterMedia: function(list, mediaType){
        list = _.filter(list, function(obj){
            return obj.type != mediaType;
        });
        return list;
    },
    loadCommonAssets: function() {
        var loader = this._createLoader();
        loader.setMaxConnections(this.MAX_CONNECTIONS);
        loader.installPlugin(createjs.Sound);
        this.commonAssets = this.filterMedia(this.commonAssets, "video");
        loader.loadManifest(this.commonAssets, true);
        loader.on("error", function(evt) {
            console.error("CommonLoader - asset preload error", evt);
        });
        this.commonLoader = loader;
    },
    loadTemplateAssets: function() {
        var loader = this._createLoader();
        loader.setMaxConnections(this.MAX_CONNECTIONS);
        this.templateAssets = this.filterMedia(this.templateAssets, "video");
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
                loader.stageLoaded = true;
                if (cb) {
                    cb();
                }
            }, this);
            loader.loadFile({
                id: assetId,
                src: path
            });
            loader.stageLoaded = false;
        } else {
            //Image is not intianlised to load, So loading image & adding to the loaders
            loader = this._createLoader();
            var instance = this;
            loader.on("complete", function(event) {
                if (_.isUndefined(instance.loaders)) {
                    instance.loaders = {};
                }
                instance.loaders[stageId] = event.target;
                instance.loaders[stageId].stageLoaded = true;
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
            loader.stageLoaded = false;
        }
    },
    destroy: function() {
        var instance = this;
        for (k in instance.loaders) {
            instance.destroyStage(k);
        }
        instance.commonAssets = [];
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
        var regex = new RegExp("^(http|https)://", "i");
        var globalConfig = EkstepRendererAPI.getGlobalConfig();
        if(regex.test(globalConfig.basepath)){
            return new createjs.LoadQueue(true, null, true);
        }else{
            return new createjs.LoadQueue(false);
        }
    },
    isStageAssetsLoaded : function(stageId) {
        // Show weather stage manifest are loaded or not.
        var manifest = JSON.parse(JSON.stringify(this.stageManifests[stageId]));
        if (!_.isUndefined(this.loaders[stageId]) && this.loaders[stageId].stageLoaded) {
            return true
        } else if (_.isUndefined(this.loaders[stageId])) {
            return true
        }
        return false
    },
    loaderWithPercentage: function (currentStageId, loader) {
        if(Renderer.theme._currentStage != currentStageId) return;
        $("svg", ".preloader-wrapper-area").remove();
        $("div", ".preloader-wrapper-area").remove();

        var bar = new ProgressBar.Circle('.preloader-wrapper-area', {
            color: '#aaa',
            // This has to be the same size as the maximum width to
            // prevent clipping
            strokeWidth: 8,
            trailWidth: 4,
            easing: 'easeInOut',
            text: {
                autoStyleContainer: false
            },
            from: { color: '#aaa', width: 2 },
            to: { color: '#0789d8', width: 6 },
            // Set default step function for all animate calls
            step: function (state, circle) {
                circle.path.setAttribute('stroke', state.color);
                circle.path.setAttribute('stroke-width', state.width);
                var value = Math.round(circle.value() * 100);
                if (value === 0) {
                    circle.setText('');
                }
                // else if(value> 50) {
                //     circle.setText(value + '%');
                //     circle.stop();
                // } 
                else {
                    circle.setText(value + '%');
                }
            }
        });
        bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
        bar.text.style.fontSize = '1rem';
        bar.text.style.color = 'black';
        if (currentStageId) {
            loader.on("progress", function () {
                if ((loader.stageLoaded || !loader.stageLoaded) && currentStageId === Renderer.theme._currentStage) {
                    var itemsInStage = loader.getItems(loader.stageLoaded);
                }
                progressPercent = loader.progress;
                if (progressPercent < 1){
                    if(document.body.contains(bar.path) ){
                        bar.animate(loader.progress);
                    }
                }
            });
        }
    }
});