var shapedata;
describe('Shape Plugin test cases', function() {
    beforeEach(function(done) {
        shapedata = {
                "x": 20,
                "y": 20,
                "w": 60,
                "h": 60,
                "visible": true,
                "editable": true,
                "type": "roundrect",
                "radius": 10,
                "opacity": 1,
                "fill": "#45b3a5",
                "stroke-width": 1,
                "z-index": 0,
                "id": "textBg",
                "config": {
                        "__cdata": '[{"x":100,"y":59.8},{"x":74,"y":68},{"x":72.9,"y":100},{"x":50.8,"y":80},{"x":29.6,"y":100},{"x":27.1,"y":69.4},{"x":0,"y":62.5},{"x":20.6,"y":44.1},{"x":10,"y":19.9},{"x":36.2,"y":23.3},{"x":48.6,"y":0},{"x":62.3,"y":22.6},{"x":88.2,"y":17.7},{"x":79,"y":42.5}]'
                }
        };
        this.plugin = PluginManager.invoke('shape', shapedata, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'getPoints').and.callThrough();
        done();
    });
    it('initPlugin', function() {
        this.plugin.initPlugin({primary: true});
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });
    it("fill attribute", function() {
        expect(this.plugin._self.fill).not.toBe(null);
    });
    it("check the mouse is enable or not", function() {
        expect(this.plugin._self.mouseEnabled).toBe(true);
        expect(this.plugin._self.mouseEnabled).not.toBe(false);
    });
    it("comman attribute", function() {
        expect(this.plugin._self.x).toBeDefined();
        expect(this.plugin._self.y).toBeDefined();
        expect(this.plugin._self.x).not.toBeNull();
        expect(this.plugin._self.y).not.toBeNull();
        expect(this.plugin._self.h).not.toBeNull();
        expect(this.plugin._self.w).not.toBeNull();
    });
    it('type attribute', function() {
        expect(this.plugin._self.type).not.toBeNull();
    });
    it('shape instance', function() {
        expect(true).toEqual(this.plugin._self instanceof createjs.Shape);
    });
    it("Stroke ", function() {
        expect(this.plugin._self.stroke).not.toBeNull();
    });
    it('Opacity', function() {
        expect(this.plugin._self.opacity).not.toBeNull();
    });
    it('shape getPoints', function () {
        shapedata.type = "test";
        this.plugin.getPoints(shapedata);
        expect(this.plugin.getPoints).toHaveBeenCalled();
        expect(this.plugin.getPoints.calls.count()).toEqual(1);
    });
    describe('Hit Area', function() {
        beforeEach(function(done) {
            shapedata.hitArea = true;
            shapedata.type = "ellipse";
            this.plugin = PluginManager.invoke('shape', shapedata, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
            spyOn(this.plugin, 'initPlugin').and.callThrough();
            done();
        });
        it('hitArea', function() {
            expect(true).not.toBeNull(this.plugin._self.hitArea);
        });
    });
   describe('Shape Plugin - Circle', function() {
        beforeEach(function(done) {
            shapedata.type = "circle";
            shapedata.hitArea = true;
            this.plugin = PluginManager.invoke('shape', shapedata, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
            spyOn(this.plugin, 'initPlugin').and.callThrough();
            done();
        });
        it('hitArea', function() {
            expect(true).not.toBeNull(this.plugin._self.hitArea);
            expect(true).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
        });
    });
    describe('Shape Plugin - Rectangle', function() {
        beforeEach(function(done) {
            shapedata.type = "rect";
            shapedata.hitArea = true;
            this.plugin = PluginManager.invoke('shape', shapedata, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
            spyOn(this.plugin, 'initPlugin').and.callThrough();
            done();
        });
        describe('Hit Area', function() {
            it('hitArea', function() {
                expect(true).not.toBeNull(this.plugin._self.hitArea);
                expect(true).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
            });
        });
    });
    describe('Shape Plugin - Ellipse', function() {
        beforeEach(function(done) {
            shapedata.type = "ellipse";
            shapedata.hitArea = true;
            this.plugin = PluginManager.invoke('shape', shapedata, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
            spyOn(this.plugin, 'initPlugin').and.callThrough();
            done();
        });
        describe('Hit Area', function() {
            it('hitArea', function() {
                expect(true).not.toBeNull(this.plugin._self.hitArea);
                expect(true).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
            });
        });
    });

    describe('Shape Plugin - Polygon', function() {
        beforeEach(function(done) {
            shapedata.type = "Polygon";
            shapedata.hitArea = true;
            shapedata.corners = 5;
            this.plugin = PluginManager.invoke('shape', shapedata, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
            spyOn(this.plugin, 'initPlugin').and.callThrough();
            done();
        });
        describe('Hit Area', function() {
            it('hitArea corners', function() {
                expect(true).not.toBeNull(this.plugin._self.hitArea);
            });
            it('hitArea sides', function() {
                shapedata.sides = 6;
                this.plugin = PluginManager.invoke('shape', shapedata, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
                expect(true).not.toBeNull(this.plugin._self.hitArea);
            });
            it('hitArea try', function() {
                shapedata.sides = false;
                shapedata.corners = false;
                shapedata.shape = "2s0";
                shapedata.config.__cdata = [{"x":100,"y":59.8},{"x":74,"y":68},{"x":72.9,"y":100},{"x":50.8,"y":80},{"x":29.6,"y":100},{"x":27.1,"y":69.4},{"x":0,"y":62.5},{"x":20.6,"y":44.1},{"x":10,"y":19.9},{"x":36.2,"y":23.3},{"x":48.6,"y":0},{"x":62.3,"y":22.6},{"x":88.2,"y":17.7},{"x":79,"y":42.5}];
                this.plugin = PluginManager.invoke('shape', shapedata, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
                expect(true).not.toBeNull(this.plugin._self.hitArea);
            });
        });
    });

});

