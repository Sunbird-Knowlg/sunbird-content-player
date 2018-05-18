describe('base Launcher for external url preview', function () {
    // Renderer plugin can't be tested as of now
    // Please move the logic to other classes and test them independently
    // Let the plugin class delegate functionality to these classes
    var baseLauncher;
    beforeAll(function (done) {
        var instance = this;
        org.ekstep.pluginframework.pluginManager.loadPluginWithDependencies('org.ekstep.externalcontentpreviewrenderer', '1.0', 'plugin', undefined, function () {
            baseLauncher = externalContentPreview.prototype;
            done()
        });
        // Loading html renderer plugin 
        request = { "url": "http://www.dailymotion.com/video/xxw52s" };
        resp = {
            "id": "api.plugin.external-url-preview.fetch-meta",
            "ver": "1.0",
            "ts": "2018-05-17 10:30:41:575+0000",
            "params": {
                "resmsgid": "593e5b70-59bd-11e8-bb33-2fea40d50b72",
                "msgid": null,
                "status": "successful",
                "err": "",
                "errmsg": ""
            },
            "responseCode": "OK",
            "result": {
                "title": "UrduIT PHP Basic Lecture 1 - Video Dailymotion",
                "image": "https://s1-ssl.dmcdn.net/BLK2a/526x297-63C.jpg",
                "description": "Watch UrduIT PHP Basic Lecture 1 by UrduITacademy on Dailymotion here",
                "source": "www.dailymotion.com",
                "og:url": "http://www.dailymotion.com/video/xxw52s",
                "og:title": "UrduIT PHP Basic Lecture 1 - Video Dailymotion",
                "og:type": "video",
                "og:description": "Watch UrduIT PHP Basic Lecture 1 by UrduITacademy on Dailymotion here",
                "og:site_name": "Dailymotion",
                "og:image": "https://s1-ssl.dmcdn.net/BLK2a/526x297-63C.jpg",
                "og:image:secure_url": "https://s1-ssl.dmcdn.net/BLK2a/526x297-63C.jpg",
                "og:image:type": "image/jpg",
            }
        };

    });
  
    it('It should inovoke initLauncher of external url', function (done) {
        spyOn(baseLauncher, "initLauncher").and.callThrough();
        baseLauncher.manifest = org.ekstep.pluginframework.pluginManager.plugins['org.ekstep.externalcontentpreviewrenderer'].m
        baseLauncher.initLauncher();
        expect(baseLauncher.initLauncher).toHaveBeenCalled();
        done();
    });

    it('generate preview from url to be called', function (done) {
        spyOn(baseLauncher, "getPreviewFromURL").and.callThrough();
        spyOn(EkstepRendererAPI, 'dispatchEvent').and.callThrough()
        baseLauncher.start();
        expect(baseLauncher.getPreviewFromURL).toHaveBeenCalled();
        setTimeout(function () {
            expect(EkstepRendererAPI.dispatchEvent).toHaveBeenCalled();
            done();
        }, 1000);
    });


    xit('should call fetchData from apiService', function(done) {
        spyOn(baseLauncher, 'fetchUrlMeta').and.returnValue(resp);
    
        baseLauncher.generatePreview().then(function(result) {
            expect(baseLauncher.fetchUrlMeta).toHaveBeenCalledWith(video);
            expect(result).toEqual(resp);
            done();
          });
      });

});
