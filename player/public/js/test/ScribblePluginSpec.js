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

        Renderer.theme = { _currentStage: '', mousePoint: function() {
                return { x: 200, y: 200 } } };
        this.plugin = PluginManager.invoke('scribble', data, parent);

        spyOn(this.plugin, 'handleMouseDown').and.callThrough();
        spyOn(this.plugin, 'handleMouseMove').and.callThrough();
        spyOn(this.plugin, 'handleMouseUp').and.callThrough();
        done();
    });

    it('Scribble plugin initPlugin', function() {
        expect(true).toEqual(this.plugin.paintBrush instanceof createjs.Shape);
        expect(true).toEqual(this.plugin._self instanceof createjs.Container);
    });

    it('Scribble plugin handleMouseDown', function() {
        this.plugin.handleMouseDown({ primary: true });
        expect(this.plugin.handleMouseDown).toHaveBeenCalled();
        expect(this.plugin.handleMouseDown.calls.count()).toEqual(1);
    });

    it('Scribble plugin handleMouseMove', function() {
        var plugin = this.plugin;
        plugin.handleMouseDown({ primary: true });
        plugin.handleMouseMove({ primary: true, _shapePoint: { x: 5, y: 5 } });
        expect(this.plugin.handleMouseMove).toHaveBeenCalled();
        expect(this.plugin.handleMouseMove.calls.count()).toEqual(1);
    });

    it('Scribble plugin handleMouseUp', function() {
        this.plugin.handleMouseUp({ primary: true });
        expect(this.plugin.handleMouseUp).toHaveBeenCalled();
        expect(this.plugin.handleMouseUp.calls.count()).toEqual(1);
    });

});