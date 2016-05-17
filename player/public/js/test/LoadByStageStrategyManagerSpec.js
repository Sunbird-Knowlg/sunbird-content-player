describe('LoadByStageStrategy test cases', function() {

    // Img plugin is used for all the event manager specs. Make sure the specs of ImagePlugin are successfull
      beforeAll(function(done) {
       
     
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

        /*LoadByStageStrategy.init(themeData, '/js/test/assets/');*/
        done();
    });
    beforeEach(function(done) {
        Renderer.theme = {
            _currentStage: ''
        };
       /* spyOn(LoadByStageStrategy,'init').and.callThrough();*/
        spyOn(LoadByStageStrategy, 'populateAssets').and.callThrough();
       

        done();
    });

    it('Test Audio manager play', function() {
        LoadByStageStrategy.populateAssets({data:"ab", stageId:"splash", preload:"true"});
        expect(LoadByStageStrategy.populateAssets).toHaveBeenCalled();
        expect(LoadByStageStrategy.populateAssets.calls.count()).toEqual(1);
        
    });
    /*it('Test LoadByStageStrategy for stop',function(){
        LoadByStageStrategy.stop({asset: 'splash_audio'});
        expect(LoadByStageStrategy.stop).toHaveBeenCalled();
        expect(LoadByStageStrategy.stop.calls.count()).toEqual(1);
    });*/

    
   
    
   




});