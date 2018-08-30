describe('EkstepRendererApi Testcase', function() {
   
    it('Should call clearPlayer Method', function(done) {
        spyOn(EkstepRendererAPI, "clearPlayer").and.callThrough();
        EkstepRendererAPI.clearPlayer();
        expect(EkstepRendererAPI.clearPlayer).toHaveBeenCalled();
        expect(EkstepRendererAPI.clearPlayer).not.toBeUndefined();
        spyOn(AudioManager, "stopAll").and.callThrough();
        AudioManager.stopAll();
        expect(AudioManager.stopAll).toHaveBeenCalled();
        expect(AudioManager.stopAll).not.toBeUndefined();
        done();
    });
  
});