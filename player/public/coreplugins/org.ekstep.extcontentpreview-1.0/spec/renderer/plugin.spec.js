describe('base Launcher for external url preview', function () {
    var baseLauncher;
    var currentIndex = 50;
    var totalIndex = 100;
    var data = {
        artifactUrl: "http://www.dailymotion.com/video/xj4qo4",
        audience: ["Learner"],
        code: "81cc2279-a070-4cce-b01d-506116804a00",
        contentType: "Resource",
        identifier: "do_21250846122002022414216",
        mimeType: "text/x-url"
    };
    var bindHtml = function (err, htmlString) {
        return '<div><p> No Preview available </p></div>';
    }
    var iframediv = document.createElement('div');
    var instance = this;
    beforeAll(function (callback) {
        // org.ekstep.service.init();

        org.ekstep.pluginframework.pluginManager.loadPluginWithDependencies('org.ekstep.extcontentpreview', '1.0', 'plugin', undefined, function () {
            baseLauncher = org.ekstep.pluginframework.pluginManager.pluginObjs['org.ekstep.extcontentpreview'];
            callback()
        });
        // Mock data 
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

        err_resp = {
            "id": "api.plugin.external-url-preview.fetch-meta",
            "ver": "1.0",
            "ts": "2018-05-17 10:30:41:575+0000",
            "params": {
                "resmsgid": "593e5b70-59bd-11e8-bb33-2fea40d50b25",
                "msgid": null,
                "status": "failure",
                "err": "",
                "errmsg": ""
            },
            "responseCode": "SERVER_ERROR",
            "result": {}
        };

    });

    beforeEach(function (done) {
        test = new getPreviewFromURL(function (cb) {
            baseLauncher.fetchUrlMeta(request.url);
            setTimeout(function () {
                console.log("in beforeEach() | setTimeout()");
                cb(baseLauncher.generatePreview(resp.result));
                done()
            }, 500);
        });
    });

    xit('It should inovoke initLauncher of external url', function (done) {
        spyOn(baseLauncher, "initLauncher").and.callThrough();
        baseLauncher.initLauncher();
        expect(baseLauncher.initLauncher).toHaveBeenCalled();
        done();
    });

    xit('generate preview from url to be called', function (done) {
        spyOn(EkstepRendererAPI, 'dispatchEvent').and.callThrough();
        setTimeout(function () {
            EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
            done();
        }, 1000);
        expect(EkstepRendererAPI.dispatchEvent).toHaveBeenCalled();
    });


    xit('generate preview from url Error response', function () {
        spyOn(baseLauncher, "getPreviewFromURL").and.callThrough();
        baseLauncher.getPreviewFromURL(data.artifactUrl, bindHtml);
    });

    xit('htmlString generate', function () {
        iframediv.innerHTML = '<div><p> No Preview available </p></div>';
        jQuery(iframediv).click(function (event) {
            setTimeout(function () {
                var newWindow = window.open(window.location.origin + window.top.location.pathname + '#!/redirect', '_blank')

                newWindow.redirectUrl = ((data.artifactUrl) +
                    '#&contentId=' + data.identifier)
                newWindow.timetobethere = 500
            }, 200)
        });
        EkstepRendererAPI.dispatchEvent("renderer:splash:hide");
        baseLauncher.addToGameArea(iframediv);
    });

    xit('should call fetchData from apiService', function (done) {
        spyOn(baseLauncher, 'fetchUrlMeta').and.returnValue(resp);
        baseLauncher.fetchUrlMeta(request.url);
        // baseLauncher.fetchUrlMeta(request.url).then(function(resp) {
        //     expect(resp).toBe(true);
        //     done();
        //   });
        var previewHtml = "<div><p> No Preview available </p></div>";
        image = '<img src=resp.result["og:image"]/>';
        previewHtml = "<div class='item preview-link-content'>" +
            "<div class='left-content'><h2 class='grey-text'>" + resp.result["og:site_name"] +
            "</h2><a class='calm'><span class='header'>" + resp.result["og:title"] +
            "</span></a><p align='left'>" + resp.result["og:description"] + "</p></div>" +
            "<div class='right-content'>" + image + "</div></div>"


        expect(previewHtml).toEqual(previewHtml);
        baseLauncher.fetchUrlMeta(request.url);
    });

    xit("causes a timeout to be called synchronously", function (done) {
        setTimeout(function () {
            var newWindow = window.open(window.location.origin + window.top.location.pathname + '#!/redirect', '_blank')

            newWindow.redirectUrl = ((data.artifactUrl) +
                '#&contentId=' + data.identifier)
            newWindow.timetobethere = 500;
            expect(newWindow.timetobethere).toEqual(500);
            done();
        }, 200);
    });


    xit('It should inovoke initLauncher of external url', function (done) {
        spyOn(baseLauncher, "reset").and.callThrough();
        baseLauncher.reset();
        expect(baseLauncher.reset).toHaveBeenCalled();
        expect(currentIndex).toEqual(50);
        done();
    });

});
