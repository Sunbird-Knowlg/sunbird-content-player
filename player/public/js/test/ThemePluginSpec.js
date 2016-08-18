describe('Theme Plugin test cases', function() {

    beforeEach(function(done) {

        var themeData = {
           theme : {
                canvasId: "gameCanvas",
            startStage: "splash",
            manifest: {
                media: [
                    { id: 'sringeri', src: 'https://ekstep-public.s3.amazonaws.com/preview/dev/img/icons/splash.png', type: 'image' },
                    { id: 'splash_audio', src: 'https://ekstep-public.s3.amazonaws.com/preview/dev/assets/sounds/goodjob.mp3', type: 'audio' }
                ]
            },
            stage: [
                { id: "splash", extends: "splash1", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } },
                { id: "splash1", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } },
                { id: "splash2", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } }
            ]
           }
        }
        // Renderer.theme = { _currentStage: '' };

        startRenderer(themeData);
        this.plugin = Renderer.theme;
    
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'start').and.callThrough();
        spyOn(this.plugin, 'updateCanvas').and.callThrough();
        spyOn(this.plugin, 'render').and.callThrough();
        
        // spyOn(this.plugin, 'addController').and.callThrough();
        spyOn(this.plugin, 'initStageControllers').and.callThrough();
        spyOn(this.plugin, 'reRender').and.callThrough();
        
        spyOn(this.plugin, 'update').and.callThrough();
        spyOn(this.plugin, 'tick').and.callThrough();
        spyOn(this.plugin, 'restart').and.callThrough();

        //spyOn(this.plugin, 'addChild').and.callThrough();

        spyOn(this.plugin, 'invokeStage').and.callThrough();
        spyOn(this.plugin, 'replaceStage').and.callThrough();

        //spyOn(this.plugin, 'preloadStages').and.callThrough();
        //spyOn(this.plugin, 'mergeStages').and.callThrough();
        //spyOn(this.plugin, 'isStageChanging').and.callThrough();
        //spyOn(this.plugin, 'transitionTo').and.callThrough();

        spyOn(this.plugin, 'removeHtmlElements').and.callThrough();
        spyOn(this.plugin, 'disableInputs').and.callThrough();
        spyOn(this.plugin, 'enableInputs').and.callThrough();

        //spyOn(this.plugin, 'getTransitionEffect').and.callThrough();        

        spyOn(this.plugin, 'getDirection').and.callThrough();
        spyOn(this.plugin, 'getEase').and.callThrough();
        spyOn(this.plugin, 'getAsset').and.callThrough(); 
        spyOn(this.plugin, 'mousePoint').and.callThrough();

        //spyOn(this.plugin, 'getStageToPreload').and.callThrough();        
        //spyOn(this.plugin, 'cleanUp').and.callThrough();        
        //spyOn(this.plugin, 'pause').and.callThrough();        
        //spyOn(this.plugin, 'resume').and.callThrough();        
        //spyOn(this.plugin, 'setParam').and.callThrough();        
        //spyOn(this.plugin, 'getParam').and.callThrough();        

        
        done();
    });

    it('Theme plugin initPlugin() fields validation', function() {
        this.plugin.initPlugin({canvasId : "gameCanvas"});
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);

        expect(true).toEqual(this.plugin._self instanceof createjs.Stage);
        expect(true).toEqual(this.plugin._self.mouseMoveOutside);

    });

    it('Theme plugin updateCanvas()', function() {
        this.plugin.updateCanvas(200, 200);
        expect(this.plugin.updateCanvas).toHaveBeenCalled();
        expect(this.plugin.updateCanvas.calls.count()).toEqual(1);
    });

     it('Theme plugin initStageControllers()', function() {
        this.plugin.initStageControllers("");
        expect(this.plugin.initStageControllers).toHaveBeenCalled();
        expect(this.plugin.initStageControllers.calls.count()).toEqual(1);
    });

    it('Theme plugin start()', function() {
        this.plugin.start({ primary: true });
        expect(this.plugin.start).toHaveBeenCalled();
        expect(this.plugin.start.calls.count()).toEqual(1);
    });

    it('Theme plugin render()', function() {
        this.plugin.render();
        expect(this.plugin.render).toHaveBeenCalled();
        expect(this.plugin.render.calls.count()).toEqual(1);
    });

    it('Theme plugin reRender()', function() {
        this.plugin.reRender();
        expect(this.plugin.reRender).toHaveBeenCalled();
        expect(this.plugin.reRender.calls.count()).toEqual(1);
    });

    it('Theme plugin update()', function() {
        this.plugin.update();
        expect(this.plugin.update).toHaveBeenCalled();
        expect(this.plugin.update.calls.count()).toEqual(1);
    });

    it('Theme plugin tick()', function() {
        this.plugin.tick();
        expect(this.plugin.tick).toHaveBeenCalled();
        expect(this.plugin.tick.calls.count()).toEqual(1);
    });

    xit('Theme plugin restart()', function() {
        this.plugin.restart();
        expect(this.plugin.restart).toHaveBeenCalled();
        expect(this.plugin.restart.calls.count()).toEqual(1);
    });

    it('Theme plugin invokeStage()', function() {
        this.plugin.invokeStage("splash");
        expect(this.plugin.invokeStage).toHaveBeenCalled();
        expect(this.plugin.invokeStage.calls.count()).toEqual(1);
    });

    it('Theme plugin replaceStage()', function() {
        this.plugin.replaceStage("splash");
        expect(this.plugin.replaceStage).toHaveBeenCalled();
        expect(this.plugin.replaceStage.calls.count()).toEqual(1);
    });

    xit('Theme plugin preloadStages()', function() {
        this.plugin.preloadStages();
        expect(this.plugin.preloadStages).toHaveBeenCalled();
        expect(this.plugin.preloadStages.calls.count()).toEqual(1);
    });

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

    it('Theme plugin getAsset()', function() {
        this.plugin.getAsset("sringeri");
        expect(this.plugin.getAsset).toHaveBeenCalled();
        expect(this.plugin.getAsset.calls.count()).toEqual(1);
    });

     it('Theme plugin mousePoint()', function() {
        this.plugin.mousePoint();
        expect(this.plugin.mousePoint).toHaveBeenCalled();
        expect(this.plugin.mousePoint.calls.count()).toEqual(1);
    });

});