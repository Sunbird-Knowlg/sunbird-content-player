describe('Hotspot Plugin test cases', function() {

    beforeEach(function(done) {
        var parent = {
            dimensions: function() {
                return {
                    x: 0,
                    y: 0,
                    w: 500,
                    h: 500
                }
            },
            addChild: function() {}
        }

        var data = data || {
                    "x": 0,
                    "y": 0,
                    "w": 50,
                    "h": 50
                };

        this.plugin = PluginManager.invoke('hotspot', data, parent);
        spyOn(this.plugin, 'initPlugin').and.callThrough();

        done();
    });

    it('Hotspot plugin Init function validation', function() {
        this.plugin.initPlugin({ primary: true });
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('Hotspot container validation', function() {
        expect(false).toEqual(this.plugin._isContainer == true);

    });
    it('Hotspot render validation', function() {
        expect(true).toEqual(this.plugin._render == true);

    });
    it('Hotspot plugin hitArea validation', function() {
        expect(true).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
    });

});