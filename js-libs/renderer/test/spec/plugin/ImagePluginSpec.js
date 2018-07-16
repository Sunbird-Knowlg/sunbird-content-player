describe('Image Plugin test cases', function() {
    beforeAll(function(done) {
        this.plugin = PluginManager.getPluginObject('do_2122479583895552001118_tween');
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'refresh').and.callThrough();
        spyOn(this.plugin, 'alignDims').and.callThrough();
        done();
    });
    describe('Image initPlugin test cases', function() {
        it('initPlugin', function() {
            this.plugin.initPlugin(this.plugin._data);
            expect(this.plugin.initPlugin).toHaveBeenCalled();
            expect(this.plugin.initPlugin.calls.count()).toEqual(1);
        });
        it('initPlugin when image is overlay asset', function() {
            var img_data = {"asset": "validate","x": 100,"y": -150,"w": 550,"h": 600,"align": "left","valign": "middle","visible": true,"id": "popup-Tint"};
            this.plugin = PluginManager.invoke('image', img_data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
            expect(this.plugin.visible).not.toBeTruthy();
        });
        it('initPlugin when image is in template', function() {
            var img_data = {"model": "validate","x": 100,"y": -150,"w": 550,"h": 600,"align": "left","valign": "middle","visible": true,"id": "popup-Tint"};
            spyOn(Renderer.theme._currentScene, 'getModelValue').and.callThrough();
            this.plugin = PluginManager.invoke('image', img_data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
            expect(Renderer.theme._currentScene.getModelValue).toHaveBeenCalled();
        });
        it('initPlugin when image is in param', function() {
            var img_data = {"param": "validate","x": 100,"y": -150,"w": 550,"h": 600,"align": "left","valign": "middle","visible": true,"id": "popup-Tint"};
            spyOn(Plugin.prototype, 'getParam').and.callThrough();
            this.plugin = PluginManager.invoke('image', img_data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
            expect(Plugin.prototype.getParam).toHaveBeenCalled();
        });
        it('initPlugin when image is in param', function(done) {
            var img_data = {"asset": "no_image","x": 100,"y": -150,"w": 550,"h": 600,"align": "left","valign": "middle","visible": true,"id": "popup-Tint"};
            this.plugin = PluginManager.invoke('image', img_data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
            setTimeout(function() {
                done();
            }, 200)
        });
    })
    describe('Image alignDims test cases', function() {
        it('alignDims when align is center & vlign is top ', function() {
            this.plugin._data.align = 'center';
            this.plugin._data.valign  = 'top'
            var align = this.plugin.alignDims();
            expect(align).toBeDefined();
            expect(this.plugin.alignDims).toHaveBeenCalled();
        });
        it('alignDims when align is right & vlign is bottom', function() {
            this.plugin._data.align = 'right';
            this.plugin._data.valign  = 'bottom'
            var align = this.plugin.alignDims();
            expect(align).toBeDefined();
            expect(this.plugin.alignDims).toHaveBeenCalled();
        });
    });
    describe('Image refresh test cases', function() {
        it('Refresh', function() {
            this.plugin.refresh();
            expect(this.plugin.refresh).toHaveBeenCalled();
            expect(this.plugin.refresh.calls.count()).toEqual(1);
        });
        it('Refresh when image is in model', function() {
            this.plugin._data.model = "image"
            this.plugin.refresh();
            expect(this.plugin.refresh).toHaveBeenCalled();
            expect(this.plugin.refresh.calls.count()).toEqual(2);
        });
        it('Refresh when image is in param', function() {
            delete this.plugin._data.model
            this.plugin._data.param = "image"
            this.plugin.refresh();
            expect(this.plugin.refresh).toHaveBeenCalled();
            expect(this.plugin.refresh.calls.count()).toEqual(3);
        });
    })
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
