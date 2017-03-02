AssetManager = {
    strategy: undefined,
    stageAudios: {},
    init: function(themeData, basePath) {
        AssetManager.strategy = new LoadByStageStrategy(themeData, basePath);
    },
    getAsset: function(stageId, assetId) {
        return AssetManager.strategy.getAsset(stageId, assetId);
    },
    initStage: function(stageId, nextStageId, prevStageId, cb) {
        if (nextStageId) {
            AssetManager.stopStageAudio(nextStageId);
        }
        if (prevStageId) {
            AssetManager.stopStageAudio(prevStageId);
        }
        AssetManager.strategy.initStage(stageId, nextStageId, prevStageId, cb);
    },
    destroy: function() {
        if (!_.isUndefined(AssetManager.strategy)) {
            AssetManager.strategy.destroy();
            AssetManager.strategy = undefined;
        }
        AssetManager.stageAudios = {};
    },
    stopStageAudio: function(stageId) {
        if(AssetManager.stageAudios[stageId] && AssetManager.stageAudios[stageId].length > 0) {
            AssetManager.stageAudios[stageId].forEach(function(audioAsset) {
                AudioManager.stop({stageId: stageId, asset:audioAsset,disableTelemetry:true});
            });
        }
    },
    addStageAudio: function(stageId, audioId) {
        if(AssetManager.stageAudios[stageId]) {
            AssetManager.stageAudios[stageId].push(audioId);
        }
    },
    loadAsset: function(stageId, assetId, path) {
        if (AssetManager.strategy) 
            AssetManager.strategy.loadAsset(stageId, assetId, path);
        else
            console.info("asset not loaded because AssetManager not initialised or failed to initialize.")
    },
    getManifest: function(content) {
        // Get all manifest defined inside content, only give stage manifest.
        // TODO : Once plugin manifest is implemented function should have to be improved.
        var manifest = {};
        manifest.media = [];
        _.each(content.stage, function(stage) {
            if (!_.isUndefined(stage.manifest) && !_.isUndefined(stage.manifest.media)) {
                if (!_.isArray(stage.manifest.media)) stage.manifest.media = [stage.manifest.media];
                _.each(stage.manifest.media, function(media) {
                    manifest.media.push(media)
                })
            }
        })
        return manifest;
    }
}