describe('Highlight Text Plugin test cases', function() {
    var htext_data = [{"event": {},"x": 6.11,"y": 87.16,"w": 35,"h": 5.02,"timings": "250,400,650,1000,1300,1500,1900,2300,2500,3000,3500,4200","__text": "This is rani family."}];
    var ht1, ht2;

    beforeAll(function() {
        this.plugin = HighlightTextPlugin.prototype;
        ht1 = PluginManager.getPluginObject("ht1");
        ht2 = PluginManager.getPluginObject("ht2");
    })

    it('Highlight Text Plugin initialized', function() {
        expect(ht1).not.toBe(null);
        expect(true).toEqual(ht1 instanceof HighlightTextPlugin);
    });

    it('Hightlight text when fontSize, highlight & id is not available', function() {
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        PluginManager.invoke('htext', htext_data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        expect(this.plugin.initPlugin).toHaveBeenCalled();
    })

    it('Playing highlight-text without audio', function(done) {
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
        ht2.stop({})
        ht2.play({});
        expect(ht2._isPlaying).toEqual(true);
        expect(ht2._isPaused).toEqual(false);
        setTimeout(function() {
            // expect(ht1._time > 0).toEqual(true);
            // expect(ht1._position.previous > 0).toEqual(true);
            // expect(ht1._position.current > 0).toEqual(true);
            expect(ht2._position.pause == 0).toEqual(true);
            expect(ht2._listener).toBeDefined();
            done();
        }, 100);
    });

    it('Pause highlight-text with audio', function(done) {
        ht2.play({});
        expect(ht2._isPlaying).toEqual(true);
        expect(ht2._isPaused).toEqual(false);
        setTimeout(function() {
            // expect(ht1._time > 0).toEqual(true);
            // expect(ht1._position.previous > 0).toEqual(true);
            // expect(ht1._position.current > 0).toEqual(true);
            expect(ht2._position.pause == 0).toEqual(true);
            expect(ht2._listener).toBeDefined();
            ht2.pause({});
            expect(ht2._isPaused).toEqual(true);
            done();
        }, 100);
    });

    it('Stop highlight-text with audio', function(done) {
        ht2._resume({});
        ht2.stop({});
        ht2.play({});
        expect(ht2._isPlaying).toEqual(true);
        expect(ht2._isPaused).toEqual(false);
        setTimeout(function() {
            // expect(ht1._time > 0).toEqual(true);
            // expect(ht1._position.previous > 0).toEqual(true);
            // expect(ht1._position.current > 0).toEqual(true);
            expect(ht2._position.pause == 0).toEqual(true);
            expect(ht2._listener).toBeDefined();
            ht2.stop({});
            expect(ht2._isPlaying).toEqual(false);
            expect(ht2._isPaused).toEqual(false);
            done();
        }, 100);
    });
});