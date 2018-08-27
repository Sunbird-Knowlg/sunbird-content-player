describe('Animation Plugin test cases', function() {
    var AnimationPlugin;
    var themeData = JSON.parse('{"loop": "true", "to":{"ease":"linear","duration":500,"__cdata":{"x":20,"y":20}},"id":"do_10096317Walking"}');
    beforeAll(function(done) {
        // Mocking documents.fonts as it is not available in phantomjs
        document.fonts = {'ready': {}};
        document.fonts.ready.then = jasmine.createSpy().and.callFake(function () {
            Renderer.update = true;
        });
        org.ekstep.contentrenderer.loadPlugins([{"mimeType":["application/vnd.ekstep.ecml-archive"],"id":"org.ekstep.ecmlrenderer","ver":1,"type":"plugin"}], [], function() {
            EkstepRendererAPI.dispatchEvent('renderer:launch:ecml');
            setTimeout(function() {
                AnimationPlugin = AnimationManager.pluginMap.tween.prototype;
                spyOn(AnimationPlugin, 'init').and.callThrough();
                spyOn(AnimationManager, 'registerPluginObject').and.callThrough();
                done();
            }, 1000)
        });
    });

    it('Animation Plugin init called', function(done) {
        setTimeout(function() {
            AnimationPlugin.init(themeData, org.ekstep.pluginframework.pluginManager.pluginInstances.do_2122479583895552001118_tween);
            expect(AnimationPlugin._id).toEqual('do_10096317Walking');
            expect(AnimationPlugin.init).toHaveBeenCalled();
            expect(AnimationPlugin._data).toBeDefined();
            expect(AnimationPlugin._id).toBeDefined();
            expect(AnimationPlugin._id).toBeDefined();
            expect(AnimationManager.registerPluginObject).toHaveBeenCalled();
            done();
        }, 10);
    });

    it('Animation Plugin init called when data id is not available', function (done) {
        setTimeout(function () {
            delete themeData.id;
            AnimationPlugin.init(themeData, org.ekstep.pluginframework.pluginManager.pluginInstances.do_2122479583895552001118_tween);
            expect(AnimationPlugin.init).toHaveBeenCalled();
            expect(AnimationPlugin._data).toBeDefined();
            expect(AnimationPlugin._id).toBeDefined();
            expect(AnimationPlugin._id).toBeDefined();
            expect(AnimationManager.registerPluginObject).toHaveBeenCalled();
            done();
        }, 10);
    });

    it('Animation Plugin initPlugin test', function() {
        setTimeout(function () {
            spyOn(AnimationPlugin, 'initPlugin').and.callThrough();
            AnimationPlugin.initPlugin(themeData, org.ekstep.pluginframework.pluginManager.pluginInstances.do_2122479583895552001118_tween);
            expect(AnimationPlugin.initPlugin).toHaveBeenCalled();
            expect(AnimationPlugin.initPlugin.calls.count()).toEqual(1);
        }, 10)
    });

    it('Animation Plugin animate test', function() {
        setTimeout(function () {
            spyOn(AnimationPlugin, 'animate').and.callThrough();
            AnimationPlugin.animate(org.ekstep.pluginframework.pluginManager.pluginInstances.do_2122479583895552001118_tween, function() {});
            expect(AnimationPlugin.animate).toHaveBeenCalled();
            expect(AnimationPlugin.animate.calls.count()).toEqual(1);
        }, 10)
    });
});
