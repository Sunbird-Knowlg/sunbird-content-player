describe('Video plugin test cases', function() {
    var videoSamplevideoSampleData, action, videoPlugin;
    beforeAll(function() {
        videoSampleData = {"x": 0,"y": 0,"w": 8,"h": 8,"asset":"video","src": "/base/public/test/testContent/assets/assets/public/content/video.mp4","type": "video/webm"};
        action = {"asset": "video","autoplay": true,"controls": true,"font": "NotoSans","h": 78,"muted": false,"pluginType": "video","type": "video/webm","w": 80,"x": 10,"y": 10,"z-index": -1,};
        videoPlugin = PluginManager.invoke('video', videoSampleData, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);;
    });
    
    xit("Video plugin initPlugin function validation", function() {
        spyOn(videoPlugin, 'initPlugin').and.callThrough()
        spyOn(videoPlugin, 'loadVideo').and.callThrough()
        videoPlugin.initPlugin(videoSampleData)
        expect(videoPlugin.initPlugin).toHaveBeenCalled();
        expect(videoPlugin.loadVideo).toHaveBeenCalled();
        expect(videoPlugin.initPlugin.calls.count()).toEqual(1);
    });

    xit("Video plugin loadVideo function", function () {
        spyOn(videoPlugin, 'createVideoElement').and.callThrough()
        spyOn(videoPlugin, 'getVideo').and.callThrough()
        spyOn(videoPlugin, 'registerEvents').and.callThrough()
        videoSampleData.autoplay = true;
        videoPlugin.loadVideo(videoSampleData)
        expect(videoPlugin.createVideoElement).toHaveBeenCalled();
        expect(videoPlugin.getVideo).toHaveBeenCalled();
        expect(videoPlugin.registerEvents).toHaveBeenCalled();
        // expect(videoPlugin.initPlugin.calls.count()).toEqual(1);
    });


    xit("Video object defined", function() {
        expect(videoSampleData).toBeDefined();
    });

    xit("Video properties", function() {
        expect(videoSampleData.x).toBeDefined();
        expect(videoSampleData.y).toBeDefined();
        expect(videoSampleData.w).toBeGreaterThan(0);
        expect(videoSampleData.h).toBeGreaterThan(0);

        //Mandatory properties for video plugin
        expect(videoSampleData.src).toBeDefined();
        expect(videoSampleData.type).toBeDefined();
    });

    xit("Check video format", function() {
        expect(videoSampleData.src).toMatch(/(.*?)\.(ogv|webm|mp4)/g);
        expect(videoSampleData.type).toMatch(/(.*?)\/(ogv|webm|mp4)/g);
    })

    xit("Play Video", function() {
        videoPlugin.play(action);
        expect(videoPlugin.play).toHaveBeenCalled();
        expect(videoPlugin.play.calls.count()).toEqual(1);
    });

    xit("Pause Video", function() {
        videoPlugin.pause(action);
        expect(videoPlugin.pause).toHaveBeenCalled();
        expect(videoPlugin.pause.calls.count()).toEqual(1);
    });

    xit("Stop Video", function() {
        videoPlugin.stop(action);
        expect(videoPlugin.stop).toHaveBeenCalled();
        expect(videoPlugin.stop.calls.count()).toEqual(1);
    });

    xit("Replay Video", function() {
        videoPlugin.replay(action);
        expect(videoPlugin.replay).toHaveBeenCalled();
        expect(videoPlugin.replay.calls.count()).toEqual(1);
    });

    xit("Start Video", function() {
        videoPlugin.start(action);
        expect(videoPlugin.start).toHaveBeenCalled();
        expect(videoPlugin.start.calls.count()).toEqual(1);
    });

    xit("Get Video", function() {
        videoPlugin.getVideo(action);
        expect(videoPlugin.getVideo).toHaveBeenCalled();
        expect(videoPlugin.getVideo.calls.count()).toEqual(1);
    });

    xit("Add Video Element Video", function() {
        videoPlugin.addVideoElement();
        expect(videoPlugin.addVideoElement).toHaveBeenCalled();
        expect(videoPlugin.addVideoElement.calls.count()).toEqual(1);
    });

    xit("Create Video Element Video", function() {
        videoPlugin.createVideoElement();
        expect(videoPlugin.createVideoElement).toHaveBeenCalled();
        expect(videoPlugin.createVideoElement.calls.count()).toEqual(1);
    });

    xit("Log Console Video", function() {
        videoPlugin.logConsole();
        expect(videoPlugin.logConsole).toHaveBeenCalled();
        expect(videoPlugin.logConsole.calls.count()).toEqual(1);
    });

    xit("Register events Video", function() {
        videoPlugin.registerEvents();
        expect(videoPlugin.registerEvents).toHaveBeenCalled();
        expect(videoPlugin.registerEvents.calls.count()).toEqual(1);
    });

    xit("Handle telemetry log Video", function() {
        videoPlugin.handleTelemetryLog();
        expect(videoPlugin.handleTelemetryLog).toHaveBeenCalled();
        expect(videoPlugin.handleTelemetryLog.calls.count()).toEqual(1);
    });

    xit("On load videoSampleData Video", function() {
        videoPlugin.onLoadvideoSampleData();
        expect(videoPlugin.onLoadvideoSampleData).toHaveBeenCalled();
        expect(videoPlugin.onLoadvideoSampleData.calls.count()).toEqual(1);
    });

    /*it("Check video format and type ", function(){
        expect(["apples", "oranges", "pears"]).toContain("oranges");
    });*/

    /*it("Video Plugin initialize", function(){
        videoPlugin = PluginManager.invoke('video', videoSampleData, parent);
    });*/
});
