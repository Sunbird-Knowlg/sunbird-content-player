describe('Video plugin test cases', function() {
    var videoSamplevideoSampleData, action, videoPlugin;
    beforeAll(function() {
        videoSampleData = {"x": 0,"y": 0,"w": 8,"h": 8,"asset":"video","src": "/base/public/test/testContent/assets/assets/public/content/video.mp4","type": "video/webm"};
        action = {"asset": "video","autoplay": true,"controls": true,"font": "NotoSans","h": 78,"muted": false,"pluginType": "video","type": "video/webm","w": 80,"x": 10,"y": 10,"z-index": -1,};
        videoPlugin = PluginManager.invoke('video', videoSampleData, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);;
    });
    
    it("Video plugin initPlugin function validation", function() {
        spyOn(videoPlugin, 'initPlugin').and.callThrough()
        spyOn(videoPlugin, 'loadVideo').and.callThrough()
        delete videoSampleData.asset;
        videoPlugin.initPlugin(videoSampleData)
        expect(videoPlugin.initPlugin).toHaveBeenCalled();
        expect(videoPlugin.loadVideo).toHaveBeenCalled();
        expect(videoPlugin.initPlugin.calls.count()).toEqual(1);
    });

    it("Video plugin loadVideo function", function () {
        spyOn(videoPlugin, 'createVideoElement').and.callThrough()
        spyOn(videoPlugin, 'getVideo').and.callThrough()
        spyOn(videoPlugin, 'registerEvents').and.callThrough()
        videoSampleData.autoplay = true;
        videoSampleData.asset = "video";
        videoPlugin.loadVideo(videoSampleData)
        expect(videoPlugin.createVideoElement).toHaveBeenCalled();
        expect(videoPlugin.getVideo).toHaveBeenCalled();
        // expect(videoPlugin.registerEvents).toHaveBeenCalled();
    });

    it("Register events Video", function () {
        spyOn(videoPlugin, 'registerEvents').and.callThrough();
        expect(this.getVideo()).toBeDefined();
        videoPlugin.registerEvents();
        expect(EkstepRendererAPI.hasEventListener('renderer:overlay:mute', videoPlugin.muteAll, videoPlugin)).toBeDefined();
        expect(EkstepRendererAPI.hasEventListener('renderer:overlay:unmute', videoPlugin.unmuteAll, videoPlugin)).toBeDefined();
        expect(videoPlugin.registerEvents).toHaveBeenCalled();
        expect(videoPlugin.registerEvents.calls.count()).toEqual(1);
    });

    xit("Handle telemetry log Video", function () {
        spyOn(videoPlugin, 'handleTelemetryLog').and.callThrough();
        videoPlugin.handleTelemetryLog();
        expect(videoPlugin.handleTelemetryLog).toHaveBeenCalled();
        expect(videoPlugin.handleTelemetryLog.calls.count()).toEqual(1);
    });

    it("Video properties", function() {
        expect(videoSampleData.x).toBeDefined();
        expect(videoSampleData.y).toBeDefined();
        expect(videoSampleData.w).toBeGreaterThan(0);
        expect(videoSampleData.h).toBeGreaterThan(0);

        //Mandatory properties for video plugin
        expect(videoSampleData.src).toBeDefined();
        expect(videoSampleData.type).toBeDefined();
    });

    it("Check video format", function() {
        expect(videoSampleData.src).toMatch(/(.*?)\.(ogv|webm|mp4)/g);
        expect(videoSampleData.type).toMatch(/(.*?)\/(ogv|webm|mp4)/g);
    })

    it("Play Video", function() {
        spyOn(videoPlugin, 'play').and.callThrough();
        videoPlugin.play(action);
        expect(videoPlugin.play).toHaveBeenCalled();
        expect(videoPlugin.play.calls.count()).toEqual(1);
    });

    // it("Pause Video", function() {
    //     spyOn(videoPlugin, 'pause').and.callThrough();
    //     videoPlugin.pause(action);
    //     expect(videoPlugin.pause).toHaveBeenCalled();
    //     expect(videoPlugin.pause.calls.count()).toEqual(1);
    // });

    // it("Stop Video", function() {
    //     spyOn(videoPlugin, 'stop').and.callThrough();
    //     videoPlugin.stop(action);
    //     expect(videoPlugin.stop).toHaveBeenCalled();
    //     expect(videoPlugin.stop.calls.count()).toEqual(1);
    // });

    it("Replay Video", function() {
        spyOn(videoPlugin, 'replay').and.callThrough();
        videoPlugin.replay(action);
        expect(videoPlugin.replay).toHaveBeenCalled();
        expect(videoPlugin.replay.calls.count()).toEqual(1);
    });

    it("Start Video", function() {
        spyOn(videoPlugin, 'start').and.callThrough();
        var videoElem = videoPlugin.getVideo(action);
        videoPlugin.start(videoElem);
        expect(videoPlugin.start).toHaveBeenCalled();
        expect(videoPlugin.start.calls.count()).toEqual(1);
    });

    it("Get Video", function() {
        spyOn(videoPlugin, 'getVideo').and.callThrough();
        videoPlugin.getVideo(action);
        expect(videoPlugin.getVideo).toHaveBeenCalled();
        expect(videoPlugin.getVideo.calls.count()).toEqual(1);
    });

    it("Add Video Element Video", function() {
        spyOn(videoPlugin, 'addVideoElement').and.callThrough();
        videoPlugin.addVideoElement();
        expect(videoPlugin.addVideoElement).toHaveBeenCalled();
        expect(videoPlugin.addVideoElement.calls.count()).toEqual(1);
    });

    it("Create Video Element Video", function() {
        spyOn(videoPlugin, 'createVideoElement').and.callThrough();
        videoPlugin.createVideoElement();
        expect(videoPlugin.createVideoElement).toHaveBeenCalled();
        expect(videoPlugin.createVideoElement.calls.count()).toEqual(1);
    });

    it("Log Console Video", function() {
        spyOn(videoPlugin, 'logConsole').and.callThrough();
        videoPlugin.logConsole();
        expect(videoPlugin.logConsole).toHaveBeenCalled();
        expect(videoPlugin.logConsole.calls.count()).toEqual(1);
    });

    xit("On load videoSampleData Video", function() {
        spyOn(videoPlugin, 'onLoadvideoSampleData').and.callThrough();
        videoPlugin.onLoadvideoSampleData();
        expect(videoPlugin.onLoadvideoSampleData).toHaveBeenCalled();
        expect(videoPlugin.onLoadvideoSampleData.calls.count()).toEqual(1);
    });
});
