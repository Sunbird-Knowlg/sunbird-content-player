var container_data = {
    "x": 0,
    "y": 0,
    "w": 50,
    "h": 50,
    "hitArea":true,
    "rotate": true,
    "shape" : [
        {
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
            "id": "textBg"
        }
    ]

};

describe('Container Plugin test cases', function() {
    beforeEach(function() {
        this.plugin = PluginManager.invoke('g', container_data, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'refresh').and.callThrough();
    });

    it('Container plugin initPlugin', function() {
        expect(true).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
        this.plugin.initPlugin({ primary: true });
        this.plugin.initPlugin();
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('Container plugin refrsh', function() {
        this.plugin.refresh({ primary: true });
        this.plugin.refresh();
        expect(this.plugin.refresh).toHaveBeenCalled();
        expect(this.plugin.refresh.calls.count()).toEqual(1);
    });

    it('Container plugin Container validation',function(){
         expect(true).toEqual(this.plugin._isContainer == true);
    });

     it('Container plugin Container validation',function(){
         expect(false).toEqual(this.plugin._rendrer == true);
    });

     it('Container plugin init attribute validation',function(){
        expect(this.plugin._self.x).toBeDefined();
        expect(this.plugin._self.y).toBeDefined();
        expect(this.plugin._self.x).not.toBeNull();
        expect(this.plugin._self.y).not.toBeNull();
        expect(this.plugin._self.h).not.toBeNull();
        expect(this.plugin._self.w).not.toBeNull();
    });
});
