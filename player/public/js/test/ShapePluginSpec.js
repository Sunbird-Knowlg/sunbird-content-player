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
                "type": "rect",
                "fill": "#FFF16E"
            }
        };
        Renderer.theme = { _currentStage: '' };
        this.plugin = PluginManager.invoke('shape', data, parent);
        done();
    });

    it('Shape plugin initPlugin', function() {
        console.log("this.plugin : ", this.plugin._self);
        expect(true).toEqual(this.plugin._self instanceof createjs.Shape);
    });


});