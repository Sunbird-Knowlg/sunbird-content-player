describe('base Launcher for external url preview', function () {
    // Renderer plugin can't be tested as of now
    // Please move the logic to other classes and test them independently
    // Let the plugin class delegate functionality to these classes
    var baseLauncher;
    var data = {
        artifactUrl: "http://www.dailymotion.com/video/xj4qo4",
        audience: ["Learner"],
        code: "81cc2279-a070-4cce-b01d-506116804a00",
        contentType: "Resource",
        identifier: "do_21250846122002022414216",
        mimeType: "text/x-url"
    };
    beforeAll(function (done) {
        var instance = this;
        org.ekstep.pluginframework.pluginManager.loadPluginWithDependencies('org.ekstep.externalcontentpreviewrenderer', '1.0', 'plugin', undefined, function () {
            baseLauncher = org.ekstep.externalcontentpreviewrenderer.prototype;
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
        baseLauncher = org.ekstep.externalcontentpreviewrenderer.prototype;
        baseLauncher.initLauncher();
        expect(baseLauncher.initLauncher).toHaveBeenCalled();
        done();
    });

    it('generate preview from url to be called', function (done) {
        var bindHtml = function (err, htmlString) {
            return '<div><p> No Preview available </p></div>';
        }


        // spyOn(baseLauncher, "getPreviewFromURL").and.callThrough();
        // baseLauncher.getPreviewFromURL(data.artifactUrl, this.bindHtml);



        spyOn(EkstepRendererAPI, 'dispatchEvent').and.callThrough()
        expect(baseLauncher.getPreviewFromURL).toHaveBeenCalled();
        setTimeout(function () {
            expect(EkstepRendererAPI.dispatchEvent).toHaveBeenCalled();
            baseLauncher.handleDivClick();
            done();
        }, 1000);
    });


    xit('should call fetchData from apiService', function(done) {
        spyOn(baseLauncher, 'fetchUrlMeta').and.returnValue(resp);
    
        it('It should inovoke initLauncher of external url', function (done) {
            spyOn(baseLauncher, "reset").and.callThrough();
            baseLauncher.reset();
            expect(baseLauncher.reset).toHaveBeenCalled();
            expect(currentIndex).toEqual(50);
            done();
        });
        baseLauncher.generatePreview().then(function(result) {
            expect(baseLauncher.fetchUrlMeta).toHaveBeenCalledWith(request.url);
            //expect(result).toEqual(resp);
            done();
          });
      });

});
