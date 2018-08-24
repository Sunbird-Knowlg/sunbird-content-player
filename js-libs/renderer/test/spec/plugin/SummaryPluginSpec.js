describe('Summary Plugin test cases', function() {
    var data;
    beforeEach(function(done) {
        this.plugin = SummaryPlugin.prototype;
        this.plugin._theme = Renderer.theme;
        this.plugin._stage = Renderer.theme._currentScene;
        this.plugin.relativeDims = function() {
            return ({ "x": 104.2392, "y": 116.79299999999999, "w": 354.9, "h": 28.613999999999997, "stretch": true })
        }
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'renderTextSummary').and.callThrough();
        data = { "controller": 'assessment_mtf' };
        done();
    });

    describe('Summary initPlugin function', function() {
        xit('When controller is available in theme', function() {
            this.plugin.initPlugin(data);
            expect(this.plugin.initPlugin).toHaveBeenCalled();
            expect(this.plugin.initPlugin.calls.count()).toEqual(1);
            expect(this.plugin.renderTextSummary).toHaveBeenCalled();
        });

        xit('When controller is same as stage controller', function() {
            data.controller = "item";
            this.plugin.initPlugin(data);
            expect(this.plugin.initPlugin).toHaveBeenCalled();
            expect(this.plugin.initPlugin.calls.count()).toEqual(1);
            expect(this.plugin.renderTextSummary).toHaveBeenCalled();
        });

        xit('When multiple stage controller are available', function() {
            this.plugin._stage._controllerMap['assesment_mtf1'] = this.plugin._stage._stageController;
            data.controller = "assesment_mtf1";
            this.plugin.initPlugin(data);
            expect(this.plugin.initPlugin).toHaveBeenCalled();
            expect(this.plugin.initPlugin.calls.count()).toEqual(1);
            expect(this.plugin.renderTextSummary).toHaveBeenCalled();
        });
    });

    xit('Summary renderTextSummary function', function(done) {
        this.plugin.renderTextSummary("text", data);
        expect(this.plugin.renderTextSummary).toHaveBeenCalled();
        expect(this.plugin.renderTextSummary.calls.count()).toEqual(1);
        setTimeout(function() {
            done();
        }, 1001)
    });
});