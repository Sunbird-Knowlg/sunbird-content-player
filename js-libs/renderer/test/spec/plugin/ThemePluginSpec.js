describe('Theme Plugin test cases', function() {

    beforeEach(function(done) {
        this.plugin = Renderer.theme;
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'mousePoint').and.callThrough();
        spyOn(this.plugin, 'updateCanvas').and.callThrough();
        spyOn(this.plugin, 'start').and.callThrough();
        spyOn(this.plugin, 'render').and.callThrough();
        spyOn(this.plugin, 'addController').and.callThrough();
        spyOn(this.plugin, 'initStageControllers').and.callThrough();
        spyOn(this.plugin, 'reRender').and.callThrough();
        spyOn(this.plugin, 'update').and.callThrough();
        spyOn(this.plugin, 'tick').and.callThrough();
        spyOn(this.plugin, 'restart').and.callThrough();
        spyOn(this.plugin, 'getAsset').and.callThrough();
        spyOn(this.plugin, 'getMedia').and.callThrough();
        // spyOn(this.plugin, 'addChild').and.callThrough();
        spyOn(this.plugin, 'replaceStage').and.callThrough();
        spyOn(this.plugin, 'invokeStage').and.callThrough();
        spyOn(this.plugin, 'preloadStages').and.callThrough();
        spyOn(this.plugin, 'mergeStages').and.callThrough();
        spyOn(this.plugin, 'isStageChanging').and.callThrough();
        spyOn(this.plugin, 'transitionTo').and.callThrough();
        spyOn(this.plugin, 'jumpToStage').and.callThrough();
        spyOn(this.plugin, 'removeHtmlElements').and.callThrough();
        spyOn(this.plugin, 'disableInputs').and.callThrough();
        spyOn(this.plugin, 'enableInputs').and.callThrough();
        //spyOn(this.plugin, 'getTransitionEffect').and.callThrough();
        spyOn(this.plugin, 'getDirection').and.callThrough();
        spyOn(this.plugin, 'getEase').and.callThrough();
        spyOn(this.plugin, 'getStagesToPreLoad').and.callThrough();
        //spyOn(this.plugin, 'cleanUp').and.callThrough();
        //spyOn(this.plugin, 'pause').and.callThrough();
        //spyOn(this.plugin, 'resume').and.callThrough();
        //spyOn(this.plugin, 'setParam').and.callThrough();
        //spyOn(this.plugin, 'getParam').and.callThrough();
        //spyOn(this.plugin, 'addLoaderElement').and.callThrough();
        //spyOn(this.plugin, 'getStageDataById').and.callThrough();
        //spyOn(this.plugin, 'clearStage').and.callThrough();
        done();
    });
    
    afterEach(function() {
      jasmine.clock().uninstall();
    });

    it('Theme plugin initPlugin() fields validation', function() {
        Renderer.theme._data.saveState = true;
        this.plugin.initPlugin(Renderer.theme._data);
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
        expect(true).toEqual(this.plugin._self instanceof createjs.Stage);
        expect(true).toEqual(this.plugin._self.mouseMoveOutside);
    });

    it('Theme plugin return mousepoint', function () {
        var mouseCord = this.plugin.mousePoint();
        expect(this.plugin.mousePoint).toHaveBeenCalled();
        expect(this.plugin.mousePoint.calls.count()).toEqual(1);
        expect(mouseCord).toBeDefined();
    });

    it('Theme plugin updateCanvas()', function() {
        var canvasDim = { w: this.plugin._self.canvas.width, h: this.plugin._self.canvas.height};
        var themeDim = { w: this.plugin._dimensions.w, h: this.plugin._dimensions.h};
        this.plugin.updateCanvas(200, 200);
        expect(this.plugin.updateCanvas).toHaveBeenCalled();
        expect(this.plugin.updateCanvas.calls.count()).toEqual(1);
        expect(canvasDim.w).not.toEqual(this.plugin._self.canvas.width)
        expect(canvasDim.h).not.toEqual(this.plugin._self.canvas.height)
        expect(themeDim.w).not.toEqual(this.plugin._dimensions.w)
        expect(themeDim.h).not.toEqual(this.plugin._dimensions.h)
    });

    xit('Theme plugin start()', function() {
        this.plugin._data = JSON.parse(JSON.stringify(contentBody)).theme;
        this.plugin.start('/base/public/test/testContent/assets/');
        expect(this.plugin.start).toHaveBeenCalled();
        expect(this.plugin.start.calls.count()).toEqual(1);
    });

    xit('Theme plugin render()', function() {
        spyOn(ControllerManager, 'reset').and.callThrough();
        spyOn(OverlayManager, 'reset').and.callThrough();
        this.plugin.render();
        expect(this.plugin.render).toHaveBeenCalled();
        expect(ControllerManager.reset).toHaveBeenCalled();
        expect(OverlayManager.reset).toHaveBeenCalled();
        expect(this.plugin.render.calls.count()).toEqual(1);
        expect(this.plugin.update).toHaveBeenCalled();
    });

    it('Theme plugin addController()', function() {
        spyOn(ControllerManager, 'get').and.callThrough();
        this.plugin.addController({name: "Test", type:"item", id:"Test"});
        expect(this.plugin.addController).toHaveBeenCalled();
        expect(ControllerManager.get).toHaveBeenCalled();
    });

    describe('Theme plugin initStageControllers()', function() {
        it('when single stage controller is present in stahe', function() {
            spyOn(ControllerManager, 'get').and.callThrough();
            this.plugin._currentScene.controller = this.plugin._currentScene._stageController;
            this.plugin.initStageControllers(Renderer.theme._currentScene);
            expect(this.plugin.initStageControllers).toHaveBeenCalled();
            expect(ControllerManager.get).toHaveBeenCalled();
        });

        it('when multiple stage controller is present in stahe', function () {
            spyOn(ControllerManager, 'get').and.callThrough();
            this.plugin._currentScene.controller = [this.plugin._currentScene._stageController];
            this.plugin.initStageControllers(Renderer.theme._currentScene);
            expect(this.plugin.initStageControllers).toHaveBeenCalled();
            expect(ControllerManager.get).toHaveBeenCalled();
            expect(ControllerManager.get.calls.count()).toEqual(this.plugin._currentScene.controller.length);
        });
    })

    xit('Theme plugin reRender()', function() {
        this.plugin.reRender();
        expect(this.plugin.reRender).toHaveBeenCalled();
        expect(this.plugin.render).toHaveBeenCalled();
        expect(this.plugin.reRender.calls.count()).toEqual(1);
        expect(this.plugin._contentParams).toEqual({});
    });

    it('Theme plugin update()', function() {
        this.plugin.update();
        expect(this.plugin.update).toHaveBeenCalled();
    });

    it('Theme plugin tick()', function() {
        this.plugin.tick();
        expect(this.plugin.tick).toHaveBeenCalled();
        expect(this.plugin.tick.calls.count()).toEqual(1);
    });

    it('Theme plugin restart()', function(done) {
        var instance = this;
        spyOn(TelemetryService, 'end').and.callThrough();
        spyOn(TelemetryService, 'start').and.callThrough();
        spyOn(AssetManager, 'initStage').and.callThrough();
        this.plugin.restart();
        setTimeout(function() { // calling settime out as assetmanages.initStage is calling callback
            expect(instance.plugin.restart).toHaveBeenCalled();
            expect(TelemetryService.end).toHaveBeenCalled();
            expect(AssetManager.initStage).toHaveBeenCalled();
            expect(TelemetryService.start).toHaveBeenCalled();
            expect(instance.plugin.restart.calls.count()).toEqual(1);
            expect(instance.plugin.render).toHaveBeenCalled();
            done();
        }, 100);
    });

    it('Theme plugin getAsset()', function () {
        var asset = this.plugin.getAsset('do_2122479583895552001118');
        expect(asset).not.toBe(undefined);
        expect(this.plugin.getAsset).toHaveBeenCalled();
        expect(this.plugin.getAsset.calls.count()).toEqual(1);
    });

    it('Theme plugin getMedia()', function () {
        var asset = this.plugin.getMedia('do_2122479583895552001118');
        expect(asset).not.toBe(undefined);
        expect(this.plugin.getMedia).toHaveBeenCalled();
        expect(this.plugin.getMedia.calls.count()).toEqual(1);
    });

    xit('Theme plugin addChild()', function() {
        var stageInstance = PluginManager.invoke('stage', this.plugin._data.stage[0], this.plugin, null, this.plugin);
        this.plugin.addChild(stageInstance._self,  stageInstance);
        expect(stageInstance).toBeDefined();
        expect(this.plugin._currentScene).toBeDefined();
    });

    xit('Theme plugin replaceStage()', function() {
        this.plugin.replaceStage("stage1");
        expect(this.plugin.replaceStage).toHaveBeenCalled();
        expect(this.plugin.replaceStage.calls.count()).toEqual(1);
    });

    xit('Theme plugin preloadStages()', function() {
        var stageInstance = PluginManager.invoke('stage', this.plugin._data.stage[0], this.plugin, null, this.plugin);
        this._currentScene = PluginManager.invoke('stage', stageInstance, this, null, this);
        this.plugin.preloadStages();
        // expect(this.plugin.preloadStages).toHaveBeenCalled();
        expect(AssetManager.strategy.loaders[this.plugin._data.stage[1].id]).not.toBe(undefined);
        // expect(this.plugin.preloadStages.calls.count()).toEqual(1);
    });

    describe('Theme plugin mergeStages()', function() {
        it('Theme plugin mergeStages()', function () {
            var mergeData = this.plugin.mergeStages({stage1: ['1']}, {stage2:['2']});
            expect(this.plugin.mergeStages).toHaveBeenCalled();
            expect(this.plugin.mergeStages.calls.count()).toEqual(1);
            expect(mergeData).toBeDefined();
        });

        it('If id is available in stage2', function () {
            var mergeData = this.plugin.mergeStages({ stage: '1', id:"stage1" }, { stage: '2', id: 'stage2' });
            expect(this.plugin.mergeStages).toHaveBeenCalled();
            expect(this.plugin.mergeStages.calls.count()).toEqual(1);
            expect(mergeData).toBeDefined();
        });
    });

    it('Theme plugin isStageChanging', function() {
        var isStageChange = this.plugin.isStageChanging();
        expect(isStageChange).toBeDefined();
        expect(this.plugin.isStageChanging).toHaveBeenCalled();
        expect(this.plugin.isStageChanging.calls.count()).toEqual(1);
    })

    // describe('Theme plugin transitionTo', function() {
    //     it('Transition on passing correct action object', function () {
    //         var action = { "asset":"theme", "command":"transitionTo", "duration":"100", "ease":"linear", "effect":"fadeIn", "type":"command", "pluginId":"theme", "value":"stage2", "transitionType":"next", "dataAttributes": { }, "stageId":"stage1"};
    //         spyOn(RecorderManager, 'stopRecording').and.callThrough();
    //         spyOn(AudioManager, 'stopAll').and.callThrough();
    //         spyOn(TimerManager, 'stopAll').and.callThrough();
    //         this.plugin.transitionTo(action);
    //         expect(RecorderManager.stopRecording).toHaveBeenCalled();
    //         expect(AudioManager.stopAll).toHaveBeenCalled();
    //         expect(TimerManager.stopAll).toHaveBeenCalled();
    //         expect(this.plugin.jumpToStage).toHaveBeenCalled();
    //     })
    // })

    it('Theme plugin removeHtmlElements()', function() {
        this.plugin.removeHtmlElements("splash");
        expect(this.plugin.removeHtmlElements).toHaveBeenCalled();
        expect(this.plugin.removeHtmlElements.calls.count()).toEqual(1);
    });

    it('Theme plugin removeHtmlElements()', function() {
        this.plugin.removeHtmlElements();
        expect(this.plugin.removeHtmlElements).toHaveBeenCalled();
        expect(this.plugin.removeHtmlElements.calls.count()).toEqual(1);
    });

    it('Theme plugin disableInputs()', function() {
        this.plugin.disableInputs();
        expect(this.plugin.disableInputs).toHaveBeenCalled();
        expect(this.plugin.disableInputs.calls.count()).toEqual(1);
    });

    it('Theme plugin enableInputs()', function() {
        this.plugin.enableInputs();
        expect(this.plugin.enableInputs).toHaveBeenCalled();
        expect(this.plugin.enableInputs.calls.count()).toEqual(1);
    });

    it('Theme plugin getDirection()', function() {
        this.plugin.getDirection();
        expect(this.plugin.getDirection).toHaveBeenCalled();
        expect(this.plugin.getDirection.calls.count()).toEqual(1);
    });

    it('Theme plugin getEase()', function() {
        this.plugin.getEase();
        expect(this.plugin.getEase).toHaveBeenCalled();
        expect(this.plugin.getEase.calls.count()).toEqual(1);
    });

    // it('Theme plugin getAsset()', function() {
    //     callback = jasmine.createSpy("callback");
    //     jasmine.clock().install();
    //     var instance = this;
    //     setTimeout(function() {
    //         callback();
    //         //console.log("Pausing 2 seconds...");
    //         var mediaAsset = instance.plugin.getAsset("sringeri");            
    //         expect(mediaAsset).toBeDefined();
    //     }, 2000);

    //     expect(callback).not.toHaveBeenCalled();
    //     jasmine.clock().tick(2000);
    //     expect(callback).toHaveBeenCalled();

    //     // CommandManager.handle({"type": "command", "asset": "sringeri", "command": "toggleShow", "stageInstanceId": Renderer.theme._currentScene._stageInstanceId,
    //     //     "stageId": Renderer.theme._currentStage});

    //     //Reference: https://makandracards.com/makandra/32477-testing-settimeout-and-setinterval-with-jasmine
    //     // Example : For setTimeout/callback
    //     /*callback = jasmine.createSpy("callback");
    //     jasmine.clock().install();

    //     setTimeout(function() {
    //         callback();
    //     }, 100);

    //     expect(callback).not.toHaveBeenCalled();

    //     jasmine.clock().tick(100);

    //     expect(callback).toHaveBeenCalled();*/
    // });

    it('Theme plugin getStagesToPreLoad()', function() {
        this.plugin.getStagesToPreLoad({next : "splash", previous: "splash"});
        expect(this.plugin.getStagesToPreLoad).toHaveBeenCalled();
        expect(this.plugin.getStagesToPreLoad.calls.count()).toEqual(1);
    });

});
