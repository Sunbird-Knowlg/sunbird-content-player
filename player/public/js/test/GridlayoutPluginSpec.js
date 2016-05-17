describe('Gridlayout Plugin test cases', function() {
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
                "h": 50 ,
                "cols":"2"
        };
        Renderer.theme = { _currentStage: '' };
        this.plugin = PluginManager.invoke('grid', data, parent);
        this.layoutPlugin = PluginManager.invoke()
        spyOn(this.plugin,'getTableProperties').and.callThrough()
        spyOn(this.plugin,'generateLayout').and.callThrough()
        done();
         /*console.log("grid",this.plugin._self);*/
    });

    it('Gridlayout plugin initPlugin', function() {
     expect(false).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
    /* console.log("grid",this.plugin._self);*/

    });
    it('Grid plugin iterate keyword availibality',function(){
         
         expect(this.plugin._self.iterate).not.toBeNull();
    });
    it('Gridlayout plugin common attributes checking',function(){
       /* console.log(this.plugin._self.x,"tet")*/

        expect(this.plugin._self.x).toBeDefined();
        expect(this.plugin._self.y).toBeDefined();
        expect(this.plugin._self.x).not.toBeNull();
        expect(this.plugin._self.y).not.toBeNull();
        
    });

    it('Gridlayout cols plugin',function(){
        expect(this.plugin._self.cols).not.toBeNull();
    });

     it('Gridlayout plugin getTableProperties function call', function() {
        this.plugin.getTableProperties({ primary: true });
        expect(this.plugin.getTableProperties).toHaveBeenCalled();
        expect(this.plugin.getTableProperties.calls.count()).toEqual(1);
    });

    it('Gridlayout plugin generateLayout function call', function() {
        this.plugin.generateLayout({ primary: true });
        expect(this.plugin.generateLayout).toHaveBeenCalled();
        expect(this.plugin.generateLayout.calls.count()).toEqual(1);
    });


});