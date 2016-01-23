AssetManager = {
    strategy: undefined,
    stageAudios: {},
    initEvent_: WTF.trace.events.createScope('AssetManager#initialize(ascii basePath)'),
    init: function(themeData, basePath) {
        var wtfScope = this.initEvent_(basePath);
        AssetManager.strategy = new LoadByStageStrategy(themeData, basePath);
        WTF.trace.leaveScope(wtfScope);
    },
    getAsset: function(stageId, assetId) {
        return AssetManager.strategy.getAsset(stageId, assetId);
    },
    initStageEvent_: WTF.trace.events.createScope('AssetManager#initStage(ascii stageId, ascii nextStageId, ascii prevStageId)'),
    initStage: function(stageId, nextStageId, prevStageId, cb) {
        var wtfScope = this.initStageEvent_(stageId, nextStageId, prevStageId);
        if (nextStageId) {
            AssetManager.stopStageAudio(nextStageId);
        }
        if (prevStageId) {
            AssetManager.stopStageAudio(prevStageId);
        }
        AssetManager.strategy.initStage(stageId, nextStageId, prevStageId, cb);
        WTF.trace.leaveScope(wtfScope);
    },
    destroy: function() {
        AssetManager.strategy.destroy();
        AssetManager.strategy = undefined;
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
    }
}