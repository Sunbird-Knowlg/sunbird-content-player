describe('Audio Plugin test cases', function() {
    beforeEach(function(done) {
        var parent = {
            dimensions: function() {
                return {
                    x: 0,
                    y: 0,
                    w: 500,
                    h: 500
                }
            }

        }
        var data = {
            "event": {
                "action": {
                    "type": "command",
                    "command": "play",
                    "asset": "audio_id"
                }
            }

        }
        this.plugin = PluginManager.invoke('audio', data, parent);
        spyOn(this.plugin, 'play').and.callThrough()
        spyOn(this.plugin, 'stop').and.callThrough();
        spyOn(this.plugin, 'togglePlay').and.callThrough();
        spyOn(this.plugin, 'pause').and.callThrough();
        done();
    });

    it('Audio plugin Container validation', function() {
        expect(true).toEqual(this.plugin._isContainer == false);
    });

    it('Audio plugin render validation', function() {
        expect(true).toEqual(this.plugin._render == false);
    });
    it('Audio plugin stop controller', function() {
        this.plugin.stop({
            asset: 'splash_audio'
        });
        expect(this.plugin.stop).toHaveBeenCalled();
        expect(this.plugin.stop.calls.count()).toEqual(1);
    });
    it('Audio plugin pause controller', function() {
        this.plugin.pause({
            asset: 'splash_audio'
        });
        expect(this.plugin.pause).toHaveBeenCalled();
        expect(this.plugin.pause.calls.count()).toEqual(1);
    });
    it('Audio plugin togglePlay controller', function() {
        this.plugin.togglePlay({
            asset: 'splash_audio'
        });
        expect(this.plugin.togglePlay).toHaveBeenCalled();
        expect(this.plugin.togglePlay.calls.count()).toEqual(1);
    });




});