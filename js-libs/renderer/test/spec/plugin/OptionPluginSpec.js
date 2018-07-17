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
    "text": {"w": 100,"h": 100,"x": 0,"y": 0,"fontsize": "2.5vw","param": "option.value.text","lineHeight": 1.4,"valign": "bottom","align": "right","font": "Verdana"}
}
var optionParent = {
    _type : "mcq",
    _options:[],
    _data:{},
    _controller: { getModelValue : function(){return {"value" : {"asset": "carpenter_img", "type": "text"}, 'selected': true}}},
    dimensions: function() {
        return {
            x: 0,
            y: 0,
            w: 500,
            h: 500
        }
    },
    addChild: function(child, childPlugin) {},
    selectOption: function() {}
}
describe('Option Plugin test cases: parent type is mcq', function() {
    beforeEach(function(done) {
        this.plugin = PluginManager.invoke('option', optionData, optionParent, { _stageController: { "_model": [{ "options": [{ "selected": false }] }], _index: 0 }, _templateVars: {}, addChild: function () { return; }, getModelValue: function () { return { "value": { "type": "text", "asset": "carpenter_img" }}}}, Renderer.theme);
        this.plugin._parent = this.plugin._parent ? this.plugin._parent : Renderer.theme._currentScene._self;
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
        delete optionData.text;
    });

    it("Option plugin renderMCQOption function validation", function() {
        spyOn(OverlayManager, 'handleSubmit').and.callThrough();
        spyOn(EventManager, 'processAppTelemetry').and.callThrough();
        expect(OverlayManager.handleSubmit).toBeDefined();
        this.plugin._modelValue.selected = true;
        this.plugin.renderMCQOption();
        this.plugin._self.dispatchEvent('click');
        expect(this.plugin.renderMCQOption).toHaveBeenCalled();
        expect(OverlayManager.handleSubmit).toHaveBeenCalled();
        expect(EventManager.processAppTelemetry).toHaveBeenCalled();
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
        this.plugin.initShadow(shadowData = {x: 0,y: 0,w: 100,h: 100,type: 'roundrect',fill: '#E89241',visible: false,opacity:  1});
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
            this.plugin = PluginManager.invoke('option', optionData, optionParent, { 
                _stageController: {
                    "_model": [{ 
                         "options": [{ "selected": false }] 
                    }],
                     _index: 0 
                }, 
                _data: {}, 
                _templateVars: {}, 
                addChild: function () { return; }, 
                getModelValue: function () { return { "value": { "type": "text", "asset": "text1" }, "selected": true }; }
            }, { 
                getAsset: function () { return "carpenter_img" }, 
                dimensions: function () {return {x: 0,y: 0,w: 500,h: 500}}
            });
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
            this.plugin.renderMTFOption({primary : true, index: 0});
            expect(this.plugin.renderMTFOption).toHaveBeenCalled();
            expect(this.plugin.renderMTFOption.calls.count()).toEqual(1);
        });

        it("Option plugin renderMTFOption function with selected validation", function() {
            this.plugin._parent._lhs_options = this.plugin._parent._rhs_options;
            this.plugin.renderMTFOption({primary : true, selected: 1});
            expect(this.plugin.renderMTFOption).toHaveBeenCalled();
            expect(this.plugin.renderMTFOption.calls.count()).toEqual(1);
        });
        
        it("Option plugin renderMTFOption function mousedown event", function () {
            spyOn(EventManager, 'processAppTelemetry').and.callThrough();
            org.ekstep.pluginframework.pluginManager.pluginInstances['do_2122479583895552001118']._self.dispatchEvent('mousedown');
            expect(EventManager.processAppTelemetry).toHaveBeenCalled();
        });

        it("Option plugin renderMTFOption function pressmove event", function () {
            var asset = org.ekstep.pluginframework.pluginManager.pluginInstances['do_2122479583895552001118'];
            spyOn(asset, 'addShadow').and.callThrough();
            asset._self.dispatchEvent('pressmove');
            expect(asset.addShadow).toHaveBeenCalled();
        });

        describe('Option plugin renderMTFOption function pressup event', function() {
            it("Option plugin renderMTFOption function pressup event & force equals false", function () {
                var asset = org.ekstep.pluginframework.pluginManager.pluginInstances['do_2122479583895552001118'];
                asset._self.x = 400;
                asset._self.y = 700;
                asset._self.dispatchEvent('pressup');
            });

            it("Option plugin renderMTFOption function pressup event & force equals true", function () {
                var asset = org.ekstep.pluginframework.pluginManager.pluginInstances['do_2122479583895552001118'];
                asset._self.x = 400;
                asset._self.y = 700;
                asset._parent._force = true;
                asset._self.dispatchEvent('pressup');
            });
        });
    });

    describe('Option Plugin initStage When rendering image', function() {
        beforeEach(function(done) {
            this.plugin = PluginManager.invoke('option', optionData, optionParent, Renderer.theme._currentScene, Renderer.theme);
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
