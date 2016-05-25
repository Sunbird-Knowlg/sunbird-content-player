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
                "options": {
                    "x": 0,
                    "y": 0,
                    "w": 50,
                    "h": 50,

                },


            }
        };
        Renderer.theme = {
            _currentStage: ''
        };
        this.plugin = PluginManager.invoke('embed', data, parent);
        spyOn(this.plugin, 'refresh').and.callThrough();
        spyOn(this.plugin, 'replaceExpressions').and.callThrough();
        spyOn(this.plugin, 'initPlugin').and.callThrough();

        done();
    });

    it('Embed plugin container field validation', function() {
        expect(true).toEqual(this.plugin._isContainer == false);

    });

    it('Embed plugin render field validation', function() {
        expect(true).toEqual(this.plugin._render == true);

    });

    it("Embed refresh function validation", function() {
        this.plugin.refresh();
        expect(this.plugin.refresh).toHaveBeenCalled();
        expect(this.plugin.refresh.calls.count()).toEqual(1);
    });
    it("Embed replaceExpressions function validation", function() {
        this.plugin.replaceExpressions({
            "model": {
                "ts_textpg_align": "Text Plugin - Align",
                "ts_textpg_wrap": "Text Plugin - Wrap"
            }
        });
        expect(this.plugin.replaceExpressions).toHaveBeenCalled();
        expect(this.plugin.replaceExpressions.calls.count()).toEqual(1);
    });

    it('Embed init function validation', function() {
        this.plugin.initPlugin({
            "template": "item"
        });
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);

    });




});