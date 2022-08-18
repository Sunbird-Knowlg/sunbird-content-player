describe('Embed Plugin test cases', function() {

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
            "embed": {
               "pluginType" : "embed",
               "template" : "item",
               "var-item": "item"
            }
        };
        this.plugin = PluginManager.invoke('embed', data, parent);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'refresh').and.callThrough();
        spyOn(this.plugin, 'replaceExpressions').and.callThrough();

        done();
    });

    it('Embed init function validation', function() {
        this.plugin.initPlugin({primary:true});
        var data = {
           "pluginType" : "embed",
           "template" : "item",
           "var-item": "item"
       };
        this.plugin.initPlugin(data);
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);

    });

    it("Embed refresh function validation", function() {
        this.plugin.refresh();
        expect(this.plugin.refresh).toHaveBeenCalled();
        expect(this.plugin.refresh.calls.count()).toEqual(1);
    });

    it("Embed replaceExpressions function validation", function() {
        this.plugin.replaceExpressions("${item.ten}");
        expect(this.plugin.replaceExpressions).toHaveBeenCalled();
        expect(this.plugin.replaceExpressions.calls.count()).toEqual(1);
    });

    it('Embed plugin container field validation', function() {
        expect(true).toEqual(this.plugin._isContainer == false);

    });

    it('Embed plugin render field validation', function() {
        expect(true).toEqual(this.plugin._render == true);

    });

});
