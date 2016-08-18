describe('Options Plugin test cases', function() {

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
            addChild: function(child, childPlugin) {}
        }
        var data = data || {
            "x": 0,
            "y": 0,
            "w": 50,
            "h": 50,
            "layout" : "table",
            "cols" : "2",
            "marginX" : "10",
            "marginY" : "5",
            "options" : "options"
               
        }
        
        this.plugin = PluginManager.invoke('options', data, parent);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'renderTableLayout').and.callThrough();
        done();
    });
    
    it("Options plugin initPlugin function validation", function() {
        this.plugin.initPlugin({primary : true}) 
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it("Options plugin renderTableLayout function validation", function() {
        this.plugin.renderTableLayout([1,2]) 
        expect(this.plugin.renderTableLayout).toHaveBeenCalled();
        expect(this.plugin.renderTableLayout.calls.count()).toEqual(1);
    });
});