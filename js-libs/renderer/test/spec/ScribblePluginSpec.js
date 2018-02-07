var scribbleData = {
    "x": 0,
    "y": 0,
    "w": 50,
    "h": 50,
    "fill": "red",
    "stroke": "green",
    "stroke-width": 10,
    "thickness": 30,
    "z-index": "10",
    "stroke": 6,
    "bgcolor": "skyblue",
    "color": "yellow"
};
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

        Renderer.theme.mousePoint = function() {
            return { x: 200, y: 200 }
        };
        this.plugin = PluginManager.invoke('scribble', scribbleData, parent);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'handleMouseDown').and.callThrough();
        spyOn(this.plugin, 'handleMouseMove').and.callThrough();
        spyOn(this.plugin, 'handleMouseUp').and.callThrough();
        spyOn(this.plugin, 'setBounderies').and.callThrough();
        spyOn(this.plugin, 'isInt').and.callThrough();
        spyOn(this.plugin, 'clear').and.callThrough();
        done();
    });

    it('Scribble plugin initPlugin', function() {
        expect(true).toEqual(this.plugin.paintBrush instanceof createjs.Shape);
        expect(true).toEqual(this.plugin._self instanceof createjs.Container);
         this.plugin.initPlugin({ primary: true });
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('Scribble plugin handleMouseDown', function() {
        this.plugin.handleMouseDown({ primary: true });
        expect(this.plugin.handleMouseDown).toHaveBeenCalled();
        expect(this.plugin.handleMouseDown.calls.count()).toEqual(1);
    });

    it('Scribble plugin setBounderies', function() {
        this.plugin.setBounderies({ primary: true });
        expect(this.plugin.setBounderies).toHaveBeenCalled();
        expect(this.plugin.setBounderies.calls.count()).toEqual(1);
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

    it('Scribble plugin isInt', function() {
        this.plugin.isInt({ primary: true });
        expect(this.plugin.isInt).toHaveBeenCalled();
        expect(this.plugin.isInt.calls.count()).toEqual(1);
    });

    it('Scribble plugin clear', function() {
        this.plugin.clear({ primary: true });
        expect(this.plugin.clear).toHaveBeenCalled();
        expect(this.plugin.clear.calls.count()).toEqual(1);
    });

});