describe('Audio Plugin test cases', function() {
    beforeEach(function(done) {
        var data = {
            "event": {
                "action": {
                    "type": "command",
                    "command": "play",
                    "asset": "do_2123843431567933441477"
                }
            }

        }
        this.plugin = PluginManager.invoke('audio', data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        spyOn(this.plugin, 'play').and.callThrough()
        spyOn(this.plugin, 'stop').and.callThrough();
        spyOn(this.plugin, 'togglePlay').and.callThrough();
        spyOn(this.plugin, 'pause').and.callThrough();
        spyOn(this.plugin, 'stopAll').and.callThrough();
        done();
    });
    it('Audio plugin Container validation', function() {
        expect(true).toEqual(this.plugin._isContainer == false);
    });
    it('Audio plugin render validation', function() {
        expect(true).toEqual(this.plugin._render == false);
    });
    it('Audio plugin play controller', function() {
        this.plugin.play({
            asset: 'do_2123843431567933441477'
        });
        expect(this.plugin.play).toHaveBeenCalled();
        expect(this.plugin.play.calls.count()).toEqual(1);
    });
    it('Audio plugin stop controller', function() {
        this.plugin.stop({
            asset: 'do_2123843431567933441477'
        });
        expect(this.plugin.stop).toHaveBeenCalled();
        expect(this.plugin.stop.calls.count()).toEqual(1);
    });
    it('Audio plugin stopAll audio', function() {
        this.plugin.stopAll({
            asset: 'do_2123843431567933441477'
        });
        expect(this.plugin.stopAll).toHaveBeenCalled();
        expect(this.plugin.stopAll.calls.count()).toEqual(1);
    });
    it('Audio plugin stop controller if condition', function() {
        this.plugin.stop({
            asset: 'do_2123843431567933441477',
            sound: true
        });
        expect(this.plugin.stop).toHaveBeenCalled();
        expect(this.plugin.stop.calls.count()).toEqual(1);
    });
    it('Audio plugin pause controller', function() {
        this.plugin.pause({
            asset: 'do_2123843431567933441477'
        });
        expect(this.plugin.pause).toHaveBeenCalled();
        expect(this.plugin.pause.calls.count()).toEqual(1);
    });
    it('Audio plugin togglePlay controller', function() {
        this.plugin.togglePlay({
            asset: 'do_2123843431567933441477'
        });
        expect(this.plugin.togglePlay).toHaveBeenCalled();
        expect(this.plugin.togglePlay.calls.count()).toEqual(1);
    });
});