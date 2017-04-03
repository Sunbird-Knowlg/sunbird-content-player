var optionData = {
        "x": 0,
        "y": 0,
        "w": 50,
        "h": 50,
        "z-index": "10",
        "stroke": 10,
        "bgcolor": "Red",
        "color": "Red",
        "option": "option[0]",
        "multiple": 4,

}
var optionParent = {
    _type : "mcq",
    _options:[],
    _data:{},
    _controller: { getModelValue : function(){return {"value" : {"asset": "carpenter_img", "type": "text"}}}},
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
describe('Option Plugin test cases: parent type is mcq', function() {

    beforeEach(function(done) {

        // this.plugin._data = {snapX: 55, snapY: 55};

        this.plugin = PluginManager.invoke('option', optionData, optionParent, { _stageController: { "_model": [ { "options": [ { "selected": false } ] } ], _index:0 } , _templateVars : {}, addChild:function(){return;}, getModelValue : function(){return {"value": {"type": "text", "asset": "carpenter_img"}}}}, {});
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'renderMCQOption').and.callThrough();
        spyOn(this.plugin, 'renderImage').and.callThrough();
        spyOn(this.plugin, 'renderText').and.callThrough();
        spyOn(this.plugin, 'initShadow').and.callThrough();
        spyOn(this.plugin, 'setOptionIndex').and.callThrough();
        spyOn(this.plugin, 'renderInnerECML').and.callThrough();
        spyOn(this.plugin, 'resolveModelValue').and.callThrough();
        done();
    });

    it('Option plulgin container validation', function() {
        expect(false).toEqual(this.plugin._isContainer == true);

    });

    it('Option Plugin render validation', function() {
        expect(true).toEqual(this.plugin._render );

    });

    it("Option plugin initPlugin function validation", function() {
        this.plugin.initPlugin({primary : true})
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it("Option plugin renderMCQOption function validation", function() {
        this.plugin.renderMCQOption({primary : true})
        expect(this.plugin.renderMCQOption).toHaveBeenCalled();
        expect(this.plugin.renderMCQOption.calls.count()).toEqual(1);
    });

    it("Option plugin renderImage function validation", function() {
        this.plugin.renderImage({primary : true, count: 2})
        expect(this.plugin.renderImage).toHaveBeenCalled();
        expect(this.plugin.renderImage.calls.count()).toEqual(1);
    });

    it("Option plugin renderText function validation", function() {
        this.plugin.renderText({primary : true})
        expect(this.plugin.renderText).toHaveBeenCalled();
        expect(this.plugin.renderText.calls.count()).toEqual(1);
    });

    it("Option plugin renderText with data function validation", function() {
        this.plugin._data = {valign: "middle", align: "center"};
        this.plugin.renderText({primary : true, fontsize: 20, valign: "middle", align: "center"})
        expect(this.plugin.renderText).toHaveBeenCalled();
        expect(this.plugin.renderText.calls.count()).toEqual(1);
    });

    it("Option plugin initShadow function validation", function() {
        this.plugin.initShadow(shadowData = {
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            type: 'roundrect',
            fill: '#E89241',
            visible: false,
            opacity:  1
        });

        expect(this.plugin.initShadow).toHaveBeenCalled();
        expect(this.plugin.initShadow.calls.count()).toEqual(1);
    });


    it("Option plugin resolveModelValue with Object function validation", function() {
        this.plugin.resolveModelValue({"event": {"action":{"asset_model":"option.value.audio","command":"play","type":"command"},"type":"click"}});
        expect(this.plugin.resolveModelValue).toHaveBeenCalled();
        expect(this.plugin.resolveModelValue.calls.count()).toEqual(1);
    });

    it("Option plugin resolveModelValue with Object and action as array function validation", function() {
        this.plugin.resolveModelValue({"event": {"action":[{"asset_model":"option.value.audio","command":"play","type":"command"}],"type":"click"}});
        expect(this.plugin.resolveModelValue).toHaveBeenCalled();
        expect(this.plugin.resolveModelValue.calls.count()).toEqual(1);
    });

    it("Option plugin resolveModelValue event as array function validation", function() {
        this.plugin.resolveModelValue({"event": [{"action":[{"asset_model":"option.value.audio","command":"play","type":"command"}],"type":"click"}]});
        expect(this.plugin.resolveModelValue).toHaveBeenCalled();
        expect(this.plugin.resolveModelValue.calls.count()).toEqual(1);
    });

    it("Option plugin resolveModelValue with Array function validation", function() {
        this.plugin.resolveModelValue({"events": [1,2]});
        expect(this.plugin.resolveModelValue).toHaveBeenCalled();
        expect(this.plugin.resolveModelValue.calls.count()).toEqual(1);
    });

    it("Option plugin resolveModelValue with events not array function validation", function() {
        this.plugin.resolveModelValue({"events": {"action":{"asset_model":"option.value.audio","command":"play","type":"command"},"type":"click"}});
        expect(this.plugin.resolveModelValue).toHaveBeenCalled();
        expect(this.plugin.resolveModelValue.calls.count()).toEqual(1);
    });

    it("Option plugin renderInnerECML function validation", function() {
        this.plugin.renderInnerECML();
        expect(this.plugin.renderInnerECML).toHaveBeenCalled();
        expect(this.plugin.renderInnerECML.calls.count()).toEqual(1);
    });

    describe('Option Plugin initStage When type is MTF', function() {
        beforeEach(function(done) {
            optionParent._controller = { getModelValue : function(){return {"value" : {"asset": "tex1", "type": "text"}}}},
            optionParent._type = "mtf";
            optionParent._rhs_options = [];
            optionParent._lhs_options = [];
            optionData.snapX = 5;
            optionData.snapY = 55;
            this.plugin = PluginManager.invoke('option', optionData, optionParent, { _stageController: { "_model": [ { "options": [ { "selected": false } ] } ], _index:0 } , _data: {}, _templateVars : {}, addChild:function(){return;}, getModelValue : function(){return {"value": {"type": "text", "asset": "text1"}};}}, {getAsset:function(){return "carpenter_img"}});
            spyOn(this.plugin, 'initPlugin').and.callThrough();
            spyOn(this.plugin, 'renderMTFOption').and.callThrough();
            done();
        });
        it('parent type is mtf', function() {
            this.plugin.initPlugin(optionData)
            expect(this.plugin.initPlugin).toHaveBeenCalled();
            expect(this.plugin.initPlugin.calls.count()).toEqual(1);
        });

        it("Option plugin renderMTFOption function validation", function() {
            this.plugin.renderMTFOption({primary : true});
            expect(this.plugin.renderMTFOption).toHaveBeenCalled();
            expect(this.plugin.renderMTFOption.calls.count()).toEqual(1);
        });

        // it("Option plugin renderMTFOption function with selected validation", function() {
        //     this.plugin.renderMTFOption({primary : true, selected: 2});
        //     expect(this.plugin.renderMTFOption).toHaveBeenCalled();
        //     expect(this.plugin.renderMTFOption.calls.count()).toEqual(1);
        // });
    });

    describe('Option Plugin initStage When rendering image', function() {
        beforeEach(function(done) {
            AssetManager.strategy = {loadAsset : function(){return}};
            optionParent._controller = { getModelValue : function(){return {"value" : {"asset": "carpenter_img", "type": "image"}}}},
            this.plugin = PluginManager.invoke('option', optionData, optionParent, { _stageController: { "_model": [ { "options": [ { "selected": false } ] } ], _index:0 } , _data: {}, _templateVars : {}, addChild:function(){return;}, getModelValue : function(){return {"value": {"type": "image", "asset": "carpenter_img"}};}}, {getAsset:function(){return "carpenter_img"}});
            spyOn(this.plugin, 'initPlugin').and.callThrough();
            done();
        });
        it('render image', function() {
            this.plugin.initPlugin({primary : true, count: 4})
            expect(this.plugin.initPlugin).toHaveBeenCalled();
            expect(this.plugin.initPlugin.calls.count()).toEqual(1);
        });
    });

});
