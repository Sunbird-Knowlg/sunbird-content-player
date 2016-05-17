describe('Audio manager test cases', function() {

    // Img plugin is used for all the event manager specs. Make sure the specs of ImagePlugin are successfull
      beforeAll(function(done) {
       console.info("present dir",__dirname);
     
        var themeData = {
            manifest: {
                media: [
                    {id: 'sringeri', src: 'sringeri.png', type: 'image'},
                    {id: 'splash_audio', src: 'splash.ogg', type: 'audio'}
                ]
            },
            stage: [
                {id:"splash", audio: {asset: 'splash_audio'}, img: {asset: 'sringeri'}}
            ]
        }

        AudioManager.init(themeData, 'public/js/test/assets/');
        done();
    });
    beforeEach(function(done) {
        Renderer.theme = {
            _currentStage: ''
        };
        spyOn(AudioManager,'uniqueId').and.callThrough();
        spyOn(AudioManager, 'play').and.callThrough();
        spyOn(AudioManager, 'togglePlay').and.callThrough();
        spyOn(AudioManager, 'pause').and.callThrough();
        spyOn(AudioManager, 'stop').and.callThrough();
        spyOn(AudioManager, 'stopAll').and.callThrough();

        done();
    });

    it('Test Audio manager play', function() {

        AudioManager.play({asset: 'splash_audio'});
        expect(AudioManager.play).toHaveBeenCalled();
        expect(AudioManager.play.calls.count()).toEqual(1);
    });
    it('Test Audio manager for stop',function(){
    	AudioManager.stop({asset: 'splash_audio'});
    	expect(AudioManager.stop).toHaveBeenCalled();
    	expect(AudioManager.stop.calls.count()).toEqual(1);
    });

    it('TestAudio manager for pause',function(){
        AudioManager.pause({asset: 'splash_audio'});
        expect(AudioManager.pause).toHaveBeenCalled();
        expect(AudioManager.pause.calls.count()).toEqual(1);
    });

    it('Test Audio manager for uniq id ',function(){
        AudioManager.uniqueId({id:'stage1'});
        expect(AudioManager.uniqueId).toHaveBeenCalled();
        expect(AudioManager.uniqueId.calls.count()).toEqual(1);
    });

   it('Test Audio manager for toggleplay ',function(){
        AudioManager.togglePlay({asset:'splash_audio'});
        expect(AudioManager.togglePlay).toHaveBeenCalled();
        expect(AudioManager.togglePlay.calls.count()).toEqual(1);
    });
    xit('Test Audio manager for stopAll ',function(){
        AudioManager.stopAll({asset:'splash_audio'});
        expect(AudioManager.stopAll).toHaveBeenCalled();
        expect(AudioManager.stopAll.calls.count()).toEqual(1);
    });
   
    
   




});