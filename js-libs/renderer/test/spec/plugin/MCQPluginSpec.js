var sampleData = {
    model:"item",
    shadow: "red",
    blur: 30,
    offsetX: 2,
    offsetY: 3,
    highlight: '#E89241',
    pluginType: "mcq",
    options: {
        "shape": {
            "w": 100,
            "h": 100,
            "x": 0,
            "y": 0,
            "fill": "#ccc",
            "type": "roundrect"
        },
        "text": {
            "w": 100,
            "h": 100,
            "x": 0,
            "y": 0,
            "fontsize": "2.5vw",
            "model": "text.title",
            "lineHeight": 1.4,
            "valign": "middle",
            "align": "center",
            "font": "Verdana"
        },
        "layout": "table",
        "highlight": "yellow",
        "w": 97,
        "h": 50,
        "x": 1.5,
        "options": "options",
        "y": 50,
        "cols": 4,
        "marginX": 5,
        "marginY": 5,
        "pluginType": "options",
        "z-index": -1,
        "font": "NotoSans, NotoSansGujarati, NotoSansOriya, NotoSansMalayalam"
    }
};

describe('MCQ Plugin test cases', function() {
    beforeEach(function(done) {
        this.plugin = PluginManager.invoke('mcq', sampleData, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        this.option = PluginManager.invoke('option', sampleData, Renderer.theme._currentScene, Renderer.theme._currentScene, Renderer.theme);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'isMultiSelect').and.callThrough();
        spyOn(this.plugin, 'selectOption').and.callThrough();
        spyOn(this.plugin, 'updateState').and.callThrough();
        done();
    });

    it('MCQ plugin initPlugin', function() {
        this.plugin._stage._currentState.mcq = this.plugin._stage._currentState.mtf;
        sampleData.multi_select = null;
        this.plugin.initPlugin(sampleData);
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('MCQ plugin isMultiSelect', function() {
        this.plugin.isMultiSelect({ primary: true });
        expect(this.plugin.isMultiSelect).toHaveBeenCalled();
        expect(this.plugin.isMultiSelect.calls.count()).toEqual(1);
    });

     it('MCQ plugin selectOption', function() {
         var option = _.clone(this.plugin._options[0]);
         option._index = 1;
         option._self.shadow._self.visible = true;
        this.plugin.selectOption(option);
        expect(this.plugin.selectOption).toHaveBeenCalled();
        expect(this.plugin.selectOption.calls.count()).toEqual(1);
    });

    it('MCQ plugin initPlugin field validation', function() {
        expect(true).toEqual(this.plugin._blur == 30);
        expect(true).toEqual(this.plugin._shadow == "#0470D8");
    });

    /* it('Mcq plugin offsetX and ofsetY field validation', function() {
        expect(true).toEqual(this.plugin._offsetX == 2);
        expect(true).toEqual(this.plugin._offsetY == 3);
    }); */

    it('Mcq multiselect validation', function() {
        expect(this.plugin._multi_select).toEqual(false);
        expect(this.plugin._multi_select).not.toEqual(true);
    });

    it('Mcq option highlight', function() {
        expect(true).toEqual(this.plugin._highlight == '#E89241');

    });

    it("Mcq plugin Renderer validation", function() {
        expect(true).toEqual(this.plugin._render == true);
    });

    it('MCQ plugin updateState', function () {
        spyOn(this.plugin, 'setState').and.callThrough();
        this.plugin.updateState(Renderer.theme._currentScene._stageController, true);
        expect(this.plugin.updateState).toHaveBeenCalled();
        expect(this.plugin.setState).toHaveBeenCalled();
    });

});
