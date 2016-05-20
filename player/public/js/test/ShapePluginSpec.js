describe('Shape Plugin test cases', function() {

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
            "shape": {
                "x": 0,
                "y": 0,
                "w": 50,
                "h": 50,
                "z-index": "10",
                "stroke": 6,
                "bgcolor": "skyblue",
                "color": "yellow",
                "type": "rect/circle/roundrect/ellipse",
                "fill": "#FFF16E"
            }
        };

        Renderer.theme = { _currentStage: '' };
        this.plugin = PluginManager.invoke('shape', data, parent);
        done();
    });

    it('Shape plugin initPlugin', function() {

        expect(true).toEqual(this.plugin._self instanceof createjs.Shape);

    });
    it("shape plugin fill attribute", function() {

        expect(this.plugin._self._filterOffsetX).toBe(0);
        expect(this.plugin._self.fill).not.toBe(null);
    });
    it("check the mouse is enable or not", function() {
        expect(this.plugin._self.mouseEnabled).toBe(true);
        expect(this.plugin._self.mouseEnabled).not.toBe(false);

    });

    it("shape pluign comman attribute", function() {
        expect(this.plugin._self.x).toBeDefined();
        expect(this.plugin._self.y).toBeDefined();
        expect(this.plugin._self.x).not.toBeNull();
        expect(this.plugin._self.y).not.toBeNull();
        expect(this.plugin._self.h).not.toBeNull();
        expect(this.plugin._self.w).not.toBeNull();

    });

    it('shape plugin type attribute', function() {
        expect(this.plugin._self.type).not.toBeNull();
    });

    it('Shpae plugin shape instance', function() {
        expect(true).toEqual(this.plugin._self instanceof createjs.Shape);

    });

    it("The shape plugin stroke defined", function() {
        expect(this.plugin._self.stroke).not.toBeNull();
    });


    it("The shape plugin stroke defined", function() {


        expect(this.plugin.opacity).not.toBeNull();
    });

    /*xit('Shape command rect', function() {
        this.plugin._self.data.type = 'rect';
        this.plugin.initPlugin(this.plugin.data.type);
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });*/





});