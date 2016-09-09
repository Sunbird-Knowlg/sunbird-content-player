var img_data = {
        "asset": "validate",
            "x": -100,
            "y": -150,
            "w": 550,
            "h": 600,
            "align": "left",
            "valign": "middle",
            "visible": true,
            "id": "popup-Tint"  
        };
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
        };

describe('Image Plugin test cases', function() {
    beforeEach(function(done) {
        Renderer.theme = {
            _currentStage: ''
        };
        this.plugin = PluginManager.invoke('image', img_data, parent);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'refresh').and.callThrough();
        spyOn(this.plugin, 'alignDims').and.callThrough();
        done();
    });
    it('initPlugin', function() {
        this.plugin.initPlugin({primary: true});
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('alignDims', function() {
        this.plugin.alignDims({primary: true});
        expect(this.plugin.alignDims).toHaveBeenCalled();
        expect(this.plugin.alignDims.calls.count()).toEqual(1);
    });

    it('Refresh', function() {
        // this.plugin = PluginManager.invoke('image', img_data, parent); 
        this._self = {}; 
        this.plugin.refresh();
        expect(this.plugin.refresh).toHaveBeenCalled();
        expect(this.plugin.refresh.calls.count()).toEqual(1);

    });

    it('X  ,Y Width and Height properties', function() {
        expect(this.plugin.x).not.toBe(null);
        expect(this.plugin.y).not.toBe(null);
        expect(this.plugin.w).not.toBe(null);
        expect(this.plugin.h).not.toBe(null);

    });
    it('Image asset properties', function() {
        expect(this.plugin.asset).not.toBeNull();
    });
});