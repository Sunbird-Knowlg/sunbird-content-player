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
                "text":   {

                    "color": "black",
                    "font": "Arial",
                    "align": "left",
                    "valign": "top",
                    "lineHeight": 0,
                    "outline": 0,
                    "fontsize": 20,

                }  
        };
        Renderer.theme = { _currentStage: '' };
        this.plugin = PluginManager.invoke('g', data, parent);
        done();
    });

    it('Container plugin initPlugin', function() {
        expect(true).toEqual(this.plugin._self.hitArea instanceof createjs.Shape);
    });


});