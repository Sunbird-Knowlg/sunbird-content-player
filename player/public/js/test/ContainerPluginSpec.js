describe('Container Plugin test cases', function() {

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
                "h": 50,
                "hitArea":true,
                
        };
        Renderer.theme = { _currentStage: '' };
        this.plugin = PluginManager.invoke('g', data, parent);
        spyOn(this.plugin, 'refresh').and.callThrough();
        done();
    });

    it('Container plugin initPlugin', function() {
        expect(true).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
    });

    it('Container plugin refrsh', function() {
        this.plugin.refresh({ primary: true });
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