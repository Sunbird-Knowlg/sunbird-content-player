describe('Highlight Text Plugin test cases', function() {
    it('Highlight Text Plugin initialized', function() {
        var ht1 = PluginManager.getPluginObject("ht1");
        expect(ht1).not.toBe(null);
        expect(true).toEqual(ht1 instanceof HighlightTextPlugin);
    });
    it('Playing highlight-text without audio', function(done) {
        var ht1 = PluginManager.getPluginObject("ht1");
        ht1.stop({});
        ht1.play({});
        expect(ht1._isPlaying).toEqual(true);
        expect(ht1._isPaused).toEqual(false);
        setTimeout(function() {
            expect(ht1._time > 0).toEqual(true);
            expect(ht1._position.previous > 0).toEqual(true);
            expect(ht1._position.current > 0).toEqual(true);
            expect(ht1._position.pause == 0).toEqual(true);
            expect(ht1._listener).toBeDefined();
            done();
        }, 100);
    });
    it('Pause highlight-text without audio', function(done) {
        var ht1 = PluginManager.getPluginObject("ht1");
        ht1.play({});
        expect(ht1._isPlaying).toEqual(true);
        expect(ht1._isPaused).toEqual(false);
        setTimeout(function() {
            expect(ht1._time > 0).toEqual(true);
            expect(ht1._position.previous > 0).toEqual(true);
            expect(ht1._position.current > 0).toEqual(true);
            expect(ht1._position.pause == 0).toEqual(true);
            expect(ht1._listener).toBeDefined();
            ht1.pause({});
            expect(ht1._isPaused).toEqual(true);
            done();
        }, 100);
    });
    it('Stop highlight-text without audio', function(done) {
        var ht1 = PluginManager.getPluginObject("ht1");
        ht1._resume({});
        ht1.stop({});
        ht1.play({});
        expect(ht1._isPlaying).toEqual(true);
        expect(ht1._isPaused).toEqual(false);
        setTimeout(function() {
            expect(ht1._time > 0).toEqual(true);
            expect(ht1._position.previous > 0).toEqual(true);
            expect(ht1._position.current > 0).toEqual(true);
            expect(ht1._position.pause == 0).toEqual(true);
            expect(ht1._listener).toBeDefined();
            ht1.stop({});
            expect(ht1._isPlaying).toEqual(false);
            expect(ht1._isPaused).toEqual(false);
            // expect(ht1._listener).not.toBeDefined();
            done();
        }, 100);
    });

    it('Playing highlight-text with audio', function(done) {
        var ht1 = PluginManager.getPluginObject("ht2");
        ht1.stop({});
        ht1.play({});
        expect(ht1._isPlaying).toEqual(true);
        expect(ht1._isPaused).toEqual(false);
        setTimeout(function() {
            expect(ht1._time > 0).toEqual(true);
            expect(ht1._position.previous > 0).toEqual(true);
            expect(ht1._position.current > 0).toEqual(true);
            expect(ht1._position.pause == 0).toEqual(true);
            expect(ht1._listener).toBeDefined();
            done();
        }, 100);
    });

    it('Pause highlight-text with audio', function(done) {
        var ht1 = PluginManager.getPluginObject("ht2");
        ht1.play({});
        expect(ht1._isPlaying).toEqual(true);
        expect(ht1._isPaused).toEqual(false);
        setTimeout(function() {
            expect(ht1._time > 0).toEqual(true);
            expect(ht1._position.previous > 0).toEqual(true);
            expect(ht1._position.current > 0).toEqual(true);
            expect(ht1._position.pause == 0).toEqual(true);
            expect(ht1._listener).toBeDefined();
            ht1.pause({});
            expect(ht1._isPaused).toEqual(true);
            done();
        }, 100);
    });

    it('Stop highlight-text with audio', function(done) {
        var ht1 = PluginManager.getPluginObject("ht2");
        ht1._resume({});
        ht1.stop({});
        ht1.play({});
        expect(ht1._isPlaying).toEqual(true);
        expect(ht1._isPaused).toEqual(false);
        setTimeout(function() {
            expect(ht1._time > 0).toEqual(true);
            expect(ht1._position.previous > 0).toEqual(true);
            expect(ht1._position.current > 0).toEqual(true);
            expect(ht1._position.pause == 0).toEqual(true);
            expect(ht1._listener).toBeDefined();
            ht1.stop({});
            expect(ht1._isPlaying).toEqual(false);
            expect(ht1._isPaused).toEqual(false);
            done();
        }, 100);
    });
});