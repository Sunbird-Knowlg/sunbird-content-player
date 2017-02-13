AssetManager = {
    strategy: undefined,
    stageAudios: {},
    init: function(themeData, basePath, cb) {
        AssetManager.strategy = new LoadByStageStrategy(themeData, basePath, cb);
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
                AudioManager.stop({stageId: stageId, asset:audioAsset});
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
        if (AssetManager.strategy) {
            var manifest = AssetManager.strategy.getManifest(content);
            return manifest
        } else {
            console.info("asset not loaded because AssetManager not initialised or failed to initialize.")
        }
    }
}