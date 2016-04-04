describe('MCQ Plugin test cases', function() {

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
            "mcq": {
            	"options": {
            		"x": 0,
	                "y": 0,
	                "w": 50,
	                "h": 50,
	                "z-index": "10",
	                "stroke": 6,
	                "bgcolor": "skyblue",
	                "color": "yellow"
            	},
            	
                
            }
        };
        Renderer.theme = { _currentStage: '' };
        this.plugin = PluginManager.invoke('mcq', data, parent);

        done();
    });

    it('MCQ plugin initPlugin field validation', function() {
        console.log(this.plugin);
        expect(true).toEqual(this.plugin._blur == 30); 
        expect(true).toEqual(this.plugin._shadow == "#0470D8"); 
    });


});