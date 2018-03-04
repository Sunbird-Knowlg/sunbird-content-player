describe('Video plugin Jasmine test cases', function() {
    var data, action;
    beforeAll(function() {
        var parent = {dimensions: function() {return {x: 0,y: 0,w: 500,h: 500}},addChild: function() {}};
        data = {"x": 0,"y": 0,"w": 40,"h": 50,"asset":"video","src": "/base/public/test/testContent/assets/assets/public/content/video.mp4","type": "video/webm","autoplay": false,"controls": false};
        action = {"asset": "video","autoplay": true,"controls": true,"font": "NotoSans","h": 78,"muted": false,"pluginType": "video","type": "video/webm","w": 80,"x": 10,"y": 10,"z-index": -1,};
        this.plugin = org.ekstep.pluginframework.pluginManager.pluginInstances.video;
        spyOn(this.plugin, 'initPlugin').and.callThrough()
    });

    it("Video plugin initPlugin function validation", function() {
        var element = document.getElementsByTagName('video')[0];
        element.parentNode.removeChild(element);
        this.plugin.initPlugin(data)
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });


    it("Video object defined", function() {
        expect(data).toBeDefined();
    });

    it("Video properties", function() {
        expect(data.x).toBeDefined();
        expect(data.y).toBeDefined();
        expect(data.w).toBeGreaterThan(0);
        expect(data.h).toBeGreaterThan(0);

        //Mandatory properties for video plugin
        expect(data.src).toBeDefined();
        expect(data.type).toBeDefined();
        expect(data.autoplay).toBeDefined();

        //Optional properties
        //expect(data.video.controls).toBeDefined();
    });

    it("Check video format", function() {
        expect(data.src).toMatch(/(.*?)\.(ogv|webm|mp4)/g);
        expect(data.type).toMatch(/(.*?)\/(ogv|webm|mp4)/g);
    })

    xit("Play Video", function() {
        this.plugin.play(action);
        expect(this.plugin.play).toHaveBeenCalled();
        expect(this.plugin.play.calls.count()).toEqual(1);
    });

    xit("Pause Video", function() {
        this.plugin.pause(action);
        expect(this.plugin.pause).toHaveBeenCalled();
        expect(this.plugin.pause.calls.count()).toEqual(1);
    });

    xit("Stop Video", function() {
        this.plugin.stop(action);
        expect(this.plugin.stop).toHaveBeenCalled();
        expect(this.plugin.stop.calls.count()).toEqual(1);
    });

    xit("Replay Video", function() {
        this.plugin.replay(action);
        expect(this.plugin.replay).toHaveBeenCalled();
        expect(this.plugin.replay.calls.count()).toEqual(1);
    });

    xit("Start Video", function() {
        this.plugin.start(action);
        expect(this.plugin.start).toHaveBeenCalled();
        expect(this.plugin.start.calls.count()).toEqual(1);
    });

    xit("Get Video", function() {
        this.plugin.getVideo(action);
        expect(this.plugin.getVideo).toHaveBeenCalled();
        expect(this.plugin.getVideo.calls.count()).toEqual(1);
    });

    xit("Add Video Element Video", function() {
        this.plugin.addVideoElement();
        expect(this.plugin.addVideoElement).toHaveBeenCalled();
        expect(this.plugin.addVideoElement.calls.count()).toEqual(1);
    });

    xit("Create Video Element Video", function() {
        this.plugin.createVideoElement();
        expect(this.plugin.createVideoElement).toHaveBeenCalled();
        expect(this.plugin.createVideoElement.calls.count()).toEqual(1);
    });

    xit("Log Console Video", function() {
        this.plugin.logConsole();
        expect(this.plugin.logConsole).toHaveBeenCalled();
        expect(this.plugin.logConsole.calls.count()).toEqual(1);
    });

    xit("Register events Video", function() {
        this.plugin.registerEvents();
        expect(this.plugin.registerEvents).toHaveBeenCalled();
        expect(this.plugin.registerEvents.calls.count()).toEqual(1);
    });

    xit("Handle telemetry log Video", function() {
        this.plugin.handleTelemetryLog();
        expect(this.plugin.handleTelemetryLog).toHaveBeenCalled();
        expect(this.plugin.handleTelemetryLog.calls.count()).toEqual(1);
    });

    xit("On load data Video", function() {
        this.plugin.onLoadData();
        expect(this.plugin.onLoadData).toHaveBeenCalled();
        expect(this.plugin.onLoadData.calls.count()).toEqual(1);
    });

    /*it("Check video format and type ", function(){
        expect(["apples", "oranges", "pears"]).toContain("oranges");
    });*/

    /*it("Video Plugin initialize", function(){
        this.plugin = PluginManager.invoke('video', data, parent);
    });*/
});
