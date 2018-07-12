var optionsData = {
    "x": 0,
    "y": 0,
    "w": 50,
    "h": 50,
    "layout" : "table",
    "cols" : "2",
    "marginX" : "10",
    "marginY" : "5",
    "options" : "options",
    "shadow": "sd",
    "highlight": "red",
    "blur": 30,
    "offsetX": 2,
    "offsetY": 3,
    "multiple": 4,
    "opacity": 0.6,
    "text": { "w": 100, "h": 100, "x": 0, "y": 0, "fontsize": "2.5vw", "model": "option.value.text", "lineHeight": 1.4, "valign": "middle", "align": "center", "font": "Verdana" }
}
describe('Options Plugin test cases', function() {

    beforeEach(function(done) {
        var parent = {
            _data : {_model : {"testKey": "testValue"}},
            _controller: { getModelValue : function(){return {"value" : {"asset": "carpenter_img", "type": "text"}}}},
            dimensions: function() {
                return {
                    "x": 0,
                    "y": 0,
                    "w": 500,
                    "h": 500
                }
            },
            addChild: function(child, childPlugin) {},
            "_shadow": "sd",
            "_highlight": "red",
            "_blur": 30,
            "_offsetX": 2,
            "_offsetY": 3
        }

        this.plugin = PluginManager.invoke('options', optionsData, parent, { _stageController: { "_model": [ { "options": [ { "selected": false } ] } ], _index:0 } , _templateVars : {}, addChild:function(){return;}, getModelValue : function(){return {"value": {"type": "text", "asset": "carpenter_img"}}}}, {});
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
        Object.assign = undefined;          // Making object.assign function undefined to handle case where ECMAScript 6 is not supported.
        this.plugin.renderTableLayout([1,2])
        expect(this.plugin.renderTableLayout).toHaveBeenCalled();
        expect(this.plugin.renderTableLayout.calls.count()).toEqual(1);
    });

    it("Options plugin renderTableLayout with row function validation", function() {
        delete optionsData.cols;
        optionsData.rows = 4;
        this.plugin.renderTableLayout([1,2]);
        expect(this.plugin.renderTableLayout).toHaveBeenCalled();
        expect(this.plugin.renderTableLayout.calls.count()).toEqual(1);
    });

    it("Options plugin renderTableLayout without row and col function validation", function() {
        delete optionsData.cols;
        delete optionsData.rows;
        this.plugin.renderTableLayout([1,2]);
        expect(this.plugin.renderTableLayout).toHaveBeenCalled();
        expect(this.plugin.renderTableLayout.calls.count()).toEqual(1);
    });
});
