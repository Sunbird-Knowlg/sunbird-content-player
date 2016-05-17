describe('Asset manager test cases', function() {

    // Img plugin is used for all the event manager specs. Make sure the specs of ImagePlugin are successfull
    beforeAll(function(done) {
        spyOn(AssetManager, 'init').and.callThrough();
        spyOn(AssetManager, 'getAsset').and.callThrough();
        spyOn(AssetManager, 'initStage').and.callThrough();
        spyOn(AssetManager, 'addStageAudio').and.callThrough();
        spyOn(AssetManager, 'stopStageAudio').and.callThrough();
        spyOn(AssetManager, 'loadAsset').and.callThrough();
        spyOn(AssetManager,'destroy').and.callThrough();

        var themeData = {
            manifest: {
                media: [{
                    id: 'sringeri',
                    src: 'sringeri.png',
                    type: 'image'
                }, {
                    id: 'splash_audio',
                    src: 'splash.ogg',
                    type: 'audio'
                }]
            },
            stage: [{
                id: "splash",
                audio: {
                    asset: 'splash_audio'
                },
                img: {
                    asset: 'sringeri'
                }
            }]
        }

        AssetManager.init(themeData, '/js/test/assets/');
        window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        setTimeout(function () {
            console.log('inside timeout');
            done();
        }, 500);
        done();
    });

    it('Test Asset manager init', function() {
        expect(AssetManager.init).toHaveBeenCalled();
        expect(AssetManager.init.calls.count()).toEqual(1);
    });

    it('Test Asset manager initStage', function(done) {
        AssetManager.initStage('splash', null, null, function() {
            expect(AssetManager.initStage).toHaveBeenCalled();
            expect(AssetManager.initStage.calls.count()).toEqual(1);
            done();
        });
    });

    it('Test Asset manager getAsset', function() {
        expect(AssetManager.initStage).toHaveBeenCalled();
        var img = AssetManager.getAsset('splash', 'sringeri');
        var abuff = AssetManager.getAsset('splash', 'splash_audio')
    });
    it('Test Asset manager stopStageAudio', function(done) {
        AssetManager.stopStageAudio({stageId:"splash"});
        expect(AssetManager.stopStageAudio).toHaveBeenCalled();
        done();
        expect(AssetManager.stopStageAudio.calls.count()).toEqual(1);
    });
    it('Test AsssetManager loadAsset function',function(){
        AssetManager.loadAsset({stageId:"splash", assetId:"splash_audio", path:"/js/test/assets"});
        expect(AssetManager.loadAsset).toHaveBeenCalled();

        expect(AssetManager.loadAsset.calls.count()).toEqual(1);
    });
    /*it('Test AssetManager destroy function',function(){
        AssetManager.destroy({ strategy: undefined, stageAudios: Object({  })});
       
        expect(AssetManager).toHaveBeenCalled();
        expect(AssetManager.destroy.calls.count()).toEqual(1);

    });*/

});