describe('Plugin manager test cases', function() {

    // Img plugin is used for all the event manager specs. Make sure the specs of ImagePlugin are successfull
    beforeAll(function(done) {
        this.plugin = newPlugin();
        spyOn(PluginManager, 'init').and.callThrough();
        spyOn(PluginManager, 'registerPlugin').and.callThrough();
        spyOn(PluginManager, 'isPlugin').and.callThrough();
        spyOn(PluginManager, 'addError').and.callThrough();
        spyOn(PluginManager, 'getErrors').and.callThrough();
        spyOn(PluginManager, 'getPlugins').and.callThrough();
        spyOn(PluginManager, 'cleanUp').and.callThrough();
        spyOn(PluginManager, 'getPluginObject').and.callThrough();
        done();
    });

    it('PluginManager initPluginframework', function() {
        PluginManager.init('fixture-stories/desertflip');
        expect(PluginManager.init).toHaveBeenCalled();
        expect(PluginManager.init.calls.count()).toEqual(1);
    });
    it('PluginManager LoadPlugins when resource is css and js',function(){
        var pluginManifest = [{"id":"org.ekstep.quiz","ver":"1.0","type":"plugin"},{"id":"org.ekstep.scribblepad","ver":"1.0","type":"plugin"},{"id":"org.ekstep.sdkeyboard","ver":"1.0","type":"plugin"},{"id":"org.ekstep.rangemultiplication","ver":"1.0","type":"plugin"}];
        var manifestMedia = [{"ver":1,"plugin":"org.ekstep.sdkeyboard","src":"stories/desertflip/assets/stories/desertflip/widgets/content-plugins/org.ekstep.sdkeyboard-1.0/renderer/numerickeyboard.css","id":"keyboard_css","type":"css","preload":true},{"ver":1,"plugin":"org.ekstep.rangemultiplication","src":"stories/desertflip/assets/stories/desertflip/widgets/content-plugins/org.ekstep.rangemultiplication-1.0/renderer/rangemultiplication.js","id":"org.ekstep.rangemultiplication","type":"js","preload":true}];
        PluginManager.loadPlugins(pluginManifest, manifestMedia,function(){
            console.info("Plugins are loaded..");
        });
    });
    it('PluginManager loadPlugins with all data',function(){
        var pluginManifest = [{"id":"org.ekstep.quiz","ver":"1.0","type":"plugin"},{"id":"org.ekstep.scribblepad","ver":"1.0","type":"plugin"},{"id":"org.ekstep.sdkeyboard","ver":"1.0","type":"plugin"},{"id":"org.ekstep.rangemultiplication","ver":"1.0","type":"plugin"}];
        var manifestMedia = [{"ver":1,"plugin":"org.ekstep.scribblepad","src":"stories/desertflip/assets/stories/desertflip/widgets/content-plugins/org.ekstep.scribblepad-1.0/renderer/scribblepadplugin.js","id":"org.ekstep.scribblepad","type":"plugin"},{"id":"org.ekstep.scribblepad","plugin":"org.ekstep.scribblepad","ver":1,"src":"stories/desertflip/assets/content-plugins/org.ekstep.scribblepad-1.0/manifest.json","type":"json"},{"id":"org.ekstep.quiz","plugin":"org.ekstep.quiz","ver":1,"src":"stories/desertflip/assets/content-plugins/org.ekstep.quiz-1.0/manifest.json","type":"json"},{"ver":1,"plugin":"org.ekstep.quiz","src":"stories/desertflip/assets/stories/desertflip/widgets/content-plugins/org.ekstep.quiz-1.0/renderer/plugin.js","id":"org.ekstep.quiz","type":"plugin"},{"src":"stories/desertflip/assets/1460624453530trash.png","assetId":"org.ekstep.scribblepad.eraser","id":"org.ekstep.scribblepad.eraser","type":"image","preload":true},{"src":"stories/desertflip/assets/1455104397576flowersl.png","id":"flowersLhighlight","asset_id":"flowersLhighlight","type":"image","preload":true},{"src":"stories/desertflip/assets/1455104477773scene5.mp3","id":"scene5_audio","asset_id":"scene5_audio","type":"audio","preload":true},{"ver":1,"plugin":"org.ekstep.sdkeyboard","src":"stories/desertflip/assets/stories/desertflip/widgets/content-plugins/org.ekstep.sdkeyboard-1.0/renderer/sdkeyboard.js","id":"org.ekstep.sdkeyboard","type":"plugin","preload":true},{"ver":1,"plugin":"org.ekstep.sdkeyboard","src":"stories/desertflip/assets/stories/desertflip/widgets/content-plugins/org.ekstep.sdkeyboard-1.0/renderer/numerickeyboard.css","id":"keyboard_css","type":"css","preload":true},{"ver":1,"plugin":"org.ekstep.rangemultiplication","src":"stories/desertflip/assets/stories/desertflip/widgets/content-plugins/org.ekstep.rangemultiplication-1.0/renderer/rangemultiplication.js","id":"org.ekstep.rangemultiplication","type":"plugin","preload":true}]
        PluginManager.loadPlugins(pluginManifest, manifestMedia,function(){
            console.info("Plugins are loaded..");
        });
    });
    it('PluginManager isPlugin with valid pluginId',function(){
        var pluginId = 'theme';
        PluginManager.isPlugin(pluginId);
    });
    it('PluginManager isPlugin with invalid pluginId',function(){
        var pid = undefined;
        PluginManager.isPlugin(pid);
    });
    it("PluginManager invoke Test",function(){
        var arrayData = [{"config":{"__cdata":"{\"opacity\":30,\"strokeWidth\":1,\"stroke\":\"rgba(255, 255, 255, 0)\",\"autoplay\":false,\"visible\":true,\"color\":\"#3399FF\"}"},"strokeWidth":1,"rotate":0,"z-index":-1,"thickness":2,"h":60,"type":"roundrect","fill":"#3399FF","stroke":"rgba(255, 255, 255, 0)","w":27,"x":25,"y":20,"stroke-width":1,"id":"989e006c-8d5c-4e48-b4b7-954ac59564da","opacity":0.3,"pluginType":"org.ekstep.scribblepad"}];
        var id = 'org.ekstep.scribblepad';
        var parent = undefined;
        PluginManager.invoke(id, arrayData, parent, undefined, undefined);
    });
    it('PluginManager getPluginObject',function(){
        var pid ="theme";
        PluginManager.getPluginObject(pid);
        expect(PluginManager.getPluginObject).toHaveBeenCalled();
    });
    it('PluginManager addError test:',function(){
        PluginManager.addError("Plugin not found");
        expect(PluginManager.addError).toHaveBeenCalled();
        expect(PluginManager.addError.calls.count()).toEqual(1);
    });
    it('PluginManager getError test',function(){
        PluginManager.getErrors();
        expect(PluginManager.addError).toHaveBeenCalled();
        expect(PluginManager.addError.calls.count()).toEqual(1);
    });
    it('PluginManager getPlugins method test',function(){
        PluginManager.getPlugins();
        expect(PluginManager.getPlugins).toHaveBeenCalled();
        expect(PluginManager.getPlugins.calls.count()).toEqual(1);
    });
    xit('PluginManager cleanup method test',function(){
        PluginManager.cleanUp();
        expect(PluginManager.cleanUp).toHaveBeenCalled();
        expect(PluginManager.cleanUp.calls.count()).toEqual(1);
    });



    /*it('Test isPlugin', function() {
        expect(PluginManager.isPlugin).toHaveBeenCalled();
        expect(PluginManager.isPlugin.calls.count()).toEqual(1);
        expect(this.isPlugin).toEqual(true);
    });

    it('Plugin invoked and invoked only once', function() {
        expect(PluginManager.invoke).toHaveBeenCalled();
        expect(PluginManager.invoke.calls.count()).toEqual(1);
        expect(this.pluginInstance).not.toEqual(null);
    });

    it('Plugin object registered and is available in cache', function() {
        expect(PluginManager.registerPluginObject).toHaveBeenCalled();
        expect(PluginManager.registerPluginObject.calls.count()).toEqual(1);
    });

    it('Plugin object fetched successfully', function() {
        expect(Object.keys(PluginManager.pluginObjMap).length).toEqual(1);
        expect(PluginManager.getPluginObject.calls.count()).toEqual(0);
        var pluginObj = PluginManager.getPluginObject('testShape');
        expect(PluginManager.getPluginObject).toHaveBeenCalled();
        expect(PluginManager.getPluginObject.calls.count()).toEqual(1);
        expect(this.pluginInstance).toEqual(pluginObj);
    });*/


});
