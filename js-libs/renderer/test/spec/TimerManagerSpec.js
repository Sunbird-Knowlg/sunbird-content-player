describe('Timer manager test cases', function() {

    beforeEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        spyOn(CommandManager, 'handle').and.callThrough();
        spyOn(TimerManager, 'start').and.callThrough();
        this.plugin = createAndInvokePlugin();
        this.action = {
            asset: 'testShape'
        }
        done();
    });

    it('Test command hide with 5000ms delay', function(done) {
        var delay = 5000;
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
        }, delay);
    });

    it('Test command show without delay', function() {
        this.action.command = 'show';
        TimerManager.start(this.action);
        expect(TimerManager.start).toHaveBeenCalled();
        expect(TimerManager.start.calls.count()).toEqual(1);
        expect(true).toEqual(this.plugin._self.visible);
    });

});
