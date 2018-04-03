describe('Animation Plugin test cases', function() {
    var AnimationPlugin;
    var themeData = JSON.parse('{"loop": "true", "to":{"ease":"linear","duration":500,"__cdata":{"x":20,"y":20}},"id":"do_10096317Walking"}');

    // Img plugin is used for all the event manager specs. Make sure the specs of ImagePlugin are successfull
    beforeAll(function(done) {
        org.ekstep.contentrenderer.loadPlugins([{"mimeType":["application/vnd.ekstep.ecml-archive"],"id":"org.ekstep.ecmlrenderer","ver":1,"type":"plugin"}], [], function() {
            setTimeout(function() {
                AnimationPlugin = AnimationManager.pluginMap.tween.prototype;
                spyOn(AnimationPlugin, 'init').and.callThrough();
                spyOn(AnimationPlugin, 'initPlugin').and.callThrough();
                spyOn(AnimationPlugin, 'animate').and.callThrough();
                spyOn(AnimationManager, 'registerPluginObject').and.callThrough();
                done();
            }, 1000)
        });
    });

    xit('Animation Plugin initPlugin test', function() {
        AnimationPlugin.initPlugin();
        expect(AnimationPlugin.initPlugin).toHaveBeenCalled();
        expect(AnimationPlugin.initPlugin.calls.count()).toEqual(0);
    });

    xit('Animation Plugin animate test', function() {
        AnimationPlugin.animate();
        expect(AnimationPlugin.animate).toHaveBeenCalled();
        expect(AnimationPlugin.animate.calls.count()).toEqual(1);
    });

    it('Animation Plugin init called', function() {
        AnimationPlugin.init(themeData, org.ekstep.pluginframework.pluginManager.pluginInstances.do_2122479583895552001118_tween);
        expect(AnimationPlugin.init).toHaveBeenCalled();
        expect(AnimationPlugin._data).toBeDefined();
        expect(AnimationPlugin._id).toBeDefined();
        expect(AnimationPlugin._id).toBeDefined();
        expect(AnimationManager.registerPluginObject).toHaveBeenCalled();
    });
});
