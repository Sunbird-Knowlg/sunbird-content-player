describe('AnimationManager test cases', function() {

    // Img plugin is used for all the event manager specs. Make sure the specs of ImagePlugin are successfull
    beforeEach(function(done) {
        spyOn(AnimationManager, 'cleanUp').and.callThrough();
        spyOn(AnimationManager, 'isPlugin').and.callThrough();
        spyOn(AnimationManager, 'registerPlugin').and.callThrough();
        spyOn(AnimationManager, 'invokePlugin').and.callThrough();
        spyOn(AnimationManager, 'getPluginObject').and.callThrough();
        spyOn(AnimationManager, 'registerPluginObject').and.callThrough();

        done();



    });

    it('Animation Manager handle function', function() {

        AnimationManager.cleanUp();
        expect(AnimationManager.cleanUp).toHaveBeenCalled();
        expect(AnimationManager.cleanUp.calls.count()).toEqual(1);

    });

    it('Animation Manager isPlugin', function() {
        AnimationManager.isPlugin("id");
        expect(AnimationManager.isPlugin).toHaveBeenCalled();
        expect(AnimationManager.isPlugin.calls.count()).toEqual(1);

    });
    xit('Animation Manager registerPlugin', function() {


        AnimationManager.registerPlugin(null);
        expect(AnimationManager.registerPlugin).toHaveBeenCalled();
        expect(AnimationManager.registerPlugin.calls.count()).toEqual(1);
    });
    it('Animation Manager for getPluginObject', function() {
        AnimationManager.getPluginObject({ id: "stage1" });
        expect(AnimationManager.getPluginObject).toHaveBeenCalled();
        expect(AnimationManager.getPluginObject.calls.count()).toEqual(1);
    });
    it('Animation Manager for registerPluginObject', function() {
        AnimationManager.registerPluginObject({ pluginObje: "stage1" });
        expect(AnimationManager.registerPluginObject).toHaveBeenCalled();
        expect(AnimationManager.registerPluginObject.calls.count()).toEqual(1);
    });

    it('Animmaton Manger invoke Plugin', function() {
        AnimationManager.invokePlugin({ id: "stage", data: "sampledata", plugin: "plugin" });
        expect(AnimationManager.invokePlugin).toHaveBeenCalled();
        expect(AnimationManager.invokePlugin.calls.count()).toEqula(1);
    })

    xit('Animation Manager for handle function', function() {
        AnimationManager.handle();
        expect(AnimationManager.handle).toHaveBeenCalled();
        expect(AnimationManager.handle.calls.count()).toEqual(1);



    });


});