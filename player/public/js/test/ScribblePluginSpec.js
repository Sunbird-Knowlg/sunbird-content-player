describe('Scribble Plugin test cases', function() {

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
            "scribble": {
                "x": 0,
                "y": 0,
                "w": 50,
                "h": 50,
                "z-index": "10",
                "stroke": 6,
                "bgcolor": "skyblue",
                "color": "yellow"
            }
        };
        Renderer.theme = { _currentStage: '' };
        this.plugin = PluginManager.invoke('scribble', data, parent);
        done();
    });

    it('Scribble plugin initPlugin', function() {
        expect(true).toEqual(this.plugin.paintBrush instanceof createjs.Shape);
        expect(true).toEqual(this.plugin._self instanceof createjs.Container);
    });


});