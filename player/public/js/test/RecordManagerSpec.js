describe('Record manager test cases', function() {

    beforeEach(function(done) {


        Renderer.theme = { _currentStage: '' };
        spyOn(RecorderManager, 'startRecording').and.callThrough();
        spyOn(RecorderManager, 'stopRecording').and.callThrough();
        spyOn(RecorderManager, 'processRecording').and.callThrough();
        spyOn(RecorderManager, '_getFilePath').and.callThrough();
        spyOn(RecorderManager, 'init').and.callThrough();
        var themeData = {
            manifest: {
                media: [
                    { id: 'sringeri', src: 'sringeri.png', type: 'image' },
                    { id: 'splash_audio', src: 'splash.ogg', type: 'audio' }
                ]
            },
            _stage: [
                { id: "splash", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } }
            ]
        }

        RecorderManager.init(themeData, '/js/test/assets/');
      
        done();
    });


    it('Test record manager init', function() {
        expect(RecorderManager.init).toHaveBeenCalled();
        expect(RecorderManager.init.calls.count()).toEqual(1);
    });

    it("Test Record manager _getFilePath ",function(){
        RecorderManager._getFilePath({_stageId:"splash"});
        expect(RecorderManager._getFilePath).toHaveBeenCalled();
        expect(RecorderManager._getFilePath.calls.count()).toEqual(1);
    });

    /* it("Test Record manager processRecording",function(){
       
        RecorderManager.processRecording({action:"sucess"});
        expect(RecorderManager.processRecording).toHaveBeenCalled();
        expect(RecorderManager.processRecording.calls.count()).toEqual(1);
    });
*/
    /*it("Test  RecordManager stopRecording",function(){
        RecorderManager.stopRecording({asset:'splash_audio'});
        expect(RecorderManager.stopRecording).toHaveBeenCalled();
        expect(RecorderManager.stopRecording.calls.count()).toEqual(1);


    });*/

    /*it('Test Asset manager initStage', function(done) {
        AssetManager.initStage('splash', null, null, function() {
            expect(AssetManager.initStage).toHaveBeenCalled();
            expect(AssetManager.initStage.calls.count()).toEqual(1);
            done();
        });
    });
*/


});