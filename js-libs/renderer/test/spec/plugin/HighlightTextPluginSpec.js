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
        this.plugin.initPlugin();
        PluginManager.invoke('htext', htext_data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        expect(this.plugin.initPlugin).toHaveBeenCalled();
    })
    it('Hightlight text getWordId', function() {
        spyOn(this.plugin, 'getWordId').and.callThrough();
        this.plugin.getWordId();
        expect(this.plugin.getWordId).toHaveBeenCalled();
    })
    it('Hightlight text play', function() {
        spyOn(this.plugin, 'play').and.callThrough();
        this.plugin.play();
        expect(this.plugin.play).toHaveBeenCalled();
    })
    it('Hightlight text pause', function() {
        spyOn(this.plugin, 'pause').and.callThrough();
        this.plugin.pause();
        expect(this.plugin.pause).toHaveBeenCalled();
    })
    it('Hightlight text togglePlay', function() {
        spyOn(this.plugin, 'togglePlay').and.callThrough();
        this.plugin.togglePlay();
        expect(this.plugin.togglePlay).toHaveBeenCalled();
    })
    it('Hightlight text _resume', function() {
        spyOn(this.plugin, '_resume').and.callThrough();
        this.plugin._resume();
        expect(this.plugin._resume).toHaveBeenCalled();
    })
    it('Hightlight text stop', function() {
        spyOn(this.plugin, 'stop').and.callThrough();
        this.plugin.stop();
        expect(this.plugin.stop).toHaveBeenCalled();
    })
    it('Hightlight text _playAudio', function() {
        spyOn(this.plugin, '_playAudio').and.callThrough();
        this.plugin._playAudio();
        expect(this.plugin._playAudio).toHaveBeenCalled();
    })
    it('Hightlight text _highlight', function() {
        spyOn(this.plugin, '_highlight').and.callThrough();
        this.plugin._highlight();
        expect(this.plugin._highlight).toHaveBeenCalled();
    })
    it('Hightlight text _cleanupHighlight', function() {
        spyOn(this.plugin, '_cleanupHighlight').and.callThrough();
        this.plugin._cleanupHighlight();
        expect(this.plugin._cleanupHighlight).toHaveBeenCalled();
    })
    it('Hightlight text _removeHighlight', function() {
        spyOn(this.plugin, '_removeHighlight').and.callThrough();
        this.plugin._removeHighlight();
        expect(this.plugin._removeHighlight).toHaveBeenCalled();
    })
    it('Hightlight text _addHighlight', function() {
        spyOn(this.plugin, '_addHighlight').and.callThrough();
        this.plugin._addHighlight();
        expect(this.plugin._addHighlight).toHaveBeenCalled();
    })
    it('Hightlight text _tokenize', function() {
        spyOn(this.plugin, '_tokenize').and.callThrough();
        this.plugin._tokenize();
        expect(this.plugin._tokenize).toHaveBeenCalled();
    })
    it('Hightlight text _getText', function() {
        spyOn(this.plugin, '_getText').and.callThrough();
        this.plugin._getText();
        expect(this.plugin._getText).toHaveBeenCalled();
    })
    it('Hightlight text _registerEvents', function() {
        spyOn(this.plugin, '_registerEvents').and.callThrough();
        this.plugin._registerEvents();
        expect(this.plugin._registerEvents).toHaveBeenCalled();
    })
    it('Hightlight text _triggerEvent', function() {
        spyOn(this.plugin, '_triggerEvent').and.callThrough();
        this.plugin._triggerEvent();
        expect(this.plugin._triggerEvent).toHaveBeenCalled();
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