describe('Text plugin data test cases', function() {
    
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

            "color": "black",
            "font": "Arial",
            "align": "left",
            "valign": "top",
            "lineHeight": 0,
            "outline": 0,
            "fontsize": 20,

        };
        Renderer.theme = {
            _currentStage: ''
        };
        this.plugin = PluginManager.invoke('text', data, parent);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        done();
    });
    it("text plugin color should not be null and should be black", function() {
        expect(this.plugin._self.color).toBe("black");
        expect(this.plugin._self.color).not.toBe(null);
    });
    it("text plugin font shold not be null and it will be by default 20px Arail", function() {
       
        expect(this.plugin._self.font).not.toBe(null);
    });

    it("text plugin align should not be null and it will be by default left", function() {
        expect(this.plugin._self.textAlign).toBe("left");
        expect(this.plugin._self.textAlign).not.toBe(null);
    });

    it("text plugin vlign match", function() {
        expect(this.plugin._self.valign).toBe("top");
        expect(this.plugin._self.valign).not.toBe(null);
    });

    it("text plugin lignHeight should not be null and it will be by default 0", function() {
        expect(this.plugin._self.lineHeight).toBe(0);
        expect(this.plugin._self.lineHeight).not.toBe(null);
    });
    it("text plugin outline should not be null and it will be by default 0", function() {
        expect(this.plugin._self.outline).toBe(0);
        expect(this.plugin._self.outline).not.toBe(null);
    });
    
   
});









