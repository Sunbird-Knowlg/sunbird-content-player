describe('Event manager test cases', function() {

    // Img plugin is used for all the event manager specs. Make sure the specs of ImagePlugin are successfull
    beforeEach(function(done) {
        spyOn(EventManager, 'registerEvents').and.callThrough();
        spyOn(EventManager, 'registerEvent').and.callThrough();
        spyOn(EventManager, 'dispatchEvent').and.callThrough();
        spyOn(EventManager, 'processMouseTelemetry').and.callThrough();
        spyOn(EventManager, 'processAppTelemetry').and.callThrough();
        this.plugin = createAndInvokePlugin();
        done();
    });

    it('Events registered and registered only once', function() {
        expect(EventManager.registerEvents).toHaveBeenCalled();
        expect(EventManager.registerEvents.calls.count()).toEqual(1);
        expect(EventManager.registerEvent).toHaveBeenCalled();
        expect(EventManager.registerEvent.calls.count()).toEqual(2);
    });

    it('Test dispatch app event', function(done) {
        spyOn(CommandManager, 'handle').and.callFake(function() {
            var action = CommandManager.handle.calls.argsFor(0)[0];
            expect(action.command).toEqual('toggleShow');
            expect(action.asset).toEqual('testShape');
            done();
        });
        EventManager.dispatchEvent('testShape', 'toggle');
    });

    it('Test dispatch event and event execution', function(done) {
        spyOn(CommandManager, 'handle').and.callThrough();
        EventManager.dispatchEvent('testShape', 'toggle');
        var p = this.plugin;
        setTimeout(function() {
            expect(CommandManager.handle).toHaveBeenCalled();
            expect(EventManager.processMouseTelemetry).not.toHaveBeenCalled();
            expect(EventManager.processAppTelemetry).toHaveBeenCalled();
            expect(CommandManager.handle.calls.count()).toEqual(1);
            expect(p._self.visible).toEqual(false);
            done();
        }, 1000);
    });

    it('Test dispatch mouse event', function(done) {
        spyOn(CommandManager, 'handle').and.callFake(function() {
            var action = CommandManager.handle.calls.argsFor(0)[0];
            expect(action.command).toEqual('show');
            expect(action.asset).toEqual('testShape');
            done();
        });
        EventManager.dispatchEvent('testShape', 'click');
    });

    it('Test dispatch mouse event and event execution', function(done) {
        spyOn(CommandManager, 'handle').and.callThrough();
        EventManager.dispatchEvent('testShape', 'click');
        var p = this.plugin;
        setTimeout(function() {
            expect(CommandManager.handle).toHaveBeenCalled();
            expect(EventManager.processMouseTelemetry).toHaveBeenCalled();
            expect(EventManager.processAppTelemetry).toHaveBeenCalled();
            expect(CommandManager.handle.calls.count()).toEqual(1);
            expect(p._self.visible).toEqual(true);
            done();
        }, 1000);
    });

});