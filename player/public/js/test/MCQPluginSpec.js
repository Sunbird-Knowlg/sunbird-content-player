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
                "option": {
                    "x": 0,
                    "y": 0,
                    "w": 50,
                    "h": 50,
                    "z-index": "10",
                    "stroke": 6,
                    "bgcolor": "skyblue",
                    "color": "yellow"
                },
            },

        };
        Renderer.theme = { _currentStage: '' };
        this.plugin = PluginManager.invoke('mcq', data, parent);
        this.option = PluginManager.invoke('option', data, parent, "splash", this.theme);
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'isMultiSelect').and.callThrough();
        spyOn(this.plugin, 'selectOption').and.callThrough();

        done();
    });

    it('MCQ plugin initPlugin', function() {
        this.plugin.initPlugin({ primary: true });
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
    });

    it('MCQ plugin isMultiSelect', function() {
        this.plugin.isMultiSelect({ primary: true });
        expect(this.plugin.isMultiSelect).toHaveBeenCalled();
        expect(this.plugin.isMultiSelect.calls.count()).toEqual(1);
    });

    xit('MCQ plugin selectOption', function() {
        this.plugin.selectOption({ primary: true });
        expect(this.plugin.selectOption).toHaveBeenCalled();
        expect(this.plugin.selectOption.calls.count()).toEqual(1);
    });

    it('MCQ plugin initPlugin field validation', function() {
       /* console.log(this.plugin);*/
        expect(true).toEqual(this.plugin._blur == 30);
        expect(true).toEqual(this.plugin._shadow == "#0470D8");
    });
    it('Mcq plugin offsetX and ofsetY field validation', function() {

        expect(true).toEqual(this.plugin._offsetX == 0);
        expect(true).toEqual(this.plugin._offsetY == 0);
    });

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

    xit('Mcq plugin Contaienr instance validation', function() {
        expect(true).toEqual(this.plugin._self instanceof createjs.Container());
    });

});