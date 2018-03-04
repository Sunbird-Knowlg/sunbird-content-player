describe('Timer manager test cases', function() {

    beforeEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        spyOn(CommandManager, 'handle').and.callThrough();
        spyOn(TimerManager, 'start').and.callThrough();
        this.plugin = org.ekstep.pluginframework.pluginManager.pluginInstances.shape;
        this.action = {
            asset: 'shape',
            type: "command",
            pluginId: "shape"
        }
        done();
    });

    it('Test command hide with 50ms delay', function(done) {
        var delay = 50;
        var instance = this;
        this.action.command = 'hide';
        this.action.delay = delay;
        expect(true).toEqual(this.plugin._self.visible);
        TimerManager.start(this.action);
        expect(TimerManager.start).toHaveBeenCalled();
        expect(TimerManager.start.calls.count()).toEqual(1);
        expect(true).toEqual(this.plugin._self.visible);
        setTimeout(function() {
            expect(false).toEqual(instance.plugin._self.visible);
            done();
        }, delay+1);
    });

    it('Test command show without delay', function(done) {
        var instance = this;
        this.action.command = 'show';
        TimerManager.start(this.action);
        expect(TimerManager.start).toHaveBeenCalled();
        expect(TimerManager.start.calls.count()).toEqual(1);
        setTimeout(function () {
            expect(true).toEqual(instance.plugin._self.visible);
            done();
        }, 1);
    });

    it('StopAll timer available in stage', function () {
        TimerManager.stopAll(Renderer.theme._currentStage);
        expect(TimerManager.instances[Renderer.theme._currentStage]).toBeUndefined();
    });

    it('Destroy all timer', function () {
        spyOn(TimerManager, 'stopAll').and.callThrough();
        TimerManager.start(this.action);
        TimerManager.destroy();
        expect(TimerManager.instances[Renderer.theme._currentStage]).toBeUndefined();
        expect(TimerManager.stopAll).toHaveBeenCalled();
    });

    it('Stop all timer', function () {
        TimerManager.stop();
    });

    it('Pause all timer', function () {
        TimerManager.pause();
    });

    it('Resume all timer', function () {
        TimerManager.resume();
    });

});
