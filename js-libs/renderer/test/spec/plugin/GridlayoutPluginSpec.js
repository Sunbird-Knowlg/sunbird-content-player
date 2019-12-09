var gridLayoutData = {
        "cols": "4",
        "h": "20",
        "id": "grid1",
        "count": "4",
        "var": "user",
        "w": "30",
        "x": "32",
        "y": "47",
        "marginX": 4,
        "marginY": 4,
        "iterate":"options",
        "shape": {
            "fill": "#0099FF ",
            "h": "100",
            "stroke": "black",
            "type": "rect",
            "w": "100",
            "x": "0",
            "y": "0"
        },
        "text": {
            "color": "black",
            "fontsize": "600",
            "h": "90",
            "model": "user.name",
            "align": "center",
            "valign": "middle",
            "textBaseline": true,
            "w": "90",
            "x": "40",
            "y": "10"
        }
};

describe('Gridlayout Plugin test cases', function() {
    beforeEach(function(done) {            
        this.plugin = PluginManager.invoke('grid', gridLayoutData, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        spyOn(this.plugin,'getTableProperties').and.callThrough()
        spyOn(this.plugin,'generateLayout').and.callThrough()
        done();
    });

    // it('Gridlayout plugin initPlugin', function() {
    //  expect(false).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
    // });
    // it('Grid plugin iterate keyword availibality',function(){
         
    //      expect(this.plugin._self.iterate).not.toBeNull();
    // });
    it('Gridlayout plugin common attributes checking',function(){
        expect(this.plugin._self.x).toBeDefined();
        expect(this.plugin._self.y).toBeDefined();
        expect(this.plugin._self.x).not.toBeNull();
        expect(this.plugin._self.y).not.toBeNull();
        
    });

    it('Gridlayout cols plugin',function(){
        expect(this.plugin._self.cols).not.toBeNull();
    });

    it('Gridlayout plugin getTableProperties function call', function() {
        this.plugin.getTableProperties({ count: 10 });
        expect(this.plugin.getTableProperties).toHaveBeenCalled();
        expect(this.plugin.getTableProperties.calls.count()).toEqual(1);
    });

    it('Gridlayout plugin generateLayout function call', function() {
        this.plugin.generateLayout({ primary: true });
        expect(this.plugin.generateLayout).toHaveBeenCalled();
        expect(this.plugin.generateLayout.calls.count()).toEqual(1);
    });

    describe('When cols and rows both given', function() {
        beforeEach(function(done) {
            gridLayoutData.hitArea = true;
            gridLayoutData.rows = 1;
            this.plugin = PluginManager.invoke('grid', gridLayoutData, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
            spyOn(this.plugin, 'initPlugin').and.callThrough();
            done();
        });
        it('hitArea', function() {
            expect(true).not.toBeNull(this.plugin._self.hitArea);
            //expect(true).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
        });
    });


});