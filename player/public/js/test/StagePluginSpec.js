describe('Stage Plugin test cases', function() {

    beforeEach(function(done) {
        var themeData = {
            canvasId: "canvas",
            startStage: "splash",
            manifest: {
                media: [
                    { id: 'sringeri', src: 'sringeri.png', type: 'image' },
                    { id: 'splash_audio', src: 'splash.ogg', type: 'audio' }
                ]
            },
            stage: [
                { id: "splash", extends: "splash1", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' }, iterate: "assessment", var: "item" },
                { id: "splash1", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } },
                { id: "splash2", audio: { asset: 'splash_audio' }, img: { asset: 'sringeri' } }
            ],
            controller: [
                { name: "assessment", type: "items", id: "assessment" }
            ]
        }
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

            id: "splash1",
            audio: { asset: 'splash_audio' },
            img: { asset: 'sringeri' }

        }
        this.theme = new ThemePlugin(themeData);
        this.theme.start('js/test/assets/');
        this.plugin = PluginManager.invoke('stage', data, parent, "splash", this.theme);
        spyOn(this.plugin, 'setParamValue').and.callThrough();
        spyOn(this.plugin, 'addController').and.callThrough();
        spyOn(this.plugin, 'getController').and.callThrough();
        spyOn(this.plugin, 'getTemplate').and.callThrough();
        spyOn(this.plugin, 'getModelValue').and.callThrough();
        spyOn(this.plugin, 'setModelValue').and.callThrough();

        spyOn(this.plugin, 'setParam').and.callThrough();
        spyOn(this.plugin, 'getParam').and.callThrough();
        done();
    });

    it('Stage plugin initPlugin', function() {
        expect(true).toEqual(this.plugin._self instanceof creatine.Scene);
    });

    it('Stage attributes validation', function() {
        expect(this.plugin._self.x).toBeDefined();
        expect(this.plugin._self.y).toBeDefined();
        expect(this.plugin._self.x).not.toBeNull();
        expect(this.plugin._self.y).not.toBeNull();
        expect(this.plugin._self.id).toBeDefined();
        expect(this.plugin._self.id).not.toBeNull();
        expect(this.plugin._self.w).not.toBeNull();
        expect(this.plugin._self.h).not.toBeNull();

    });
    it("Stage extend attribute validation", function() {
        expect(this.plugin._self.extend).not.toBeNull();

    });
    it('Stage plugin setParamValue', function() {
        this.plugin.setParamValue(200);
        expect(this.plugin.setParamValue).toHaveBeenCalled();
        expect(this.plugin.setParamValue.calls.count()).toEqual(1);
    });
    it('Stage plugin add controller', function() {
        this.plugin.addController("x");
        expect(this.plugin.addController).toHaveBeenCalled();
        expect(this.plugin.addController.calls.count()).toEqual(1);
    });
    it('stage plugin getController', function() {
        this.plugin.getController("x");
        expect(this.plugin.getController).toHaveBeenCalled();
        expect(this.plugin.getController.calls.count()).toEqual(1);

    });
    it('stage plugin getTemplate', function() {

        this.plugin.getTemplate("x");
        expect(this.plugin.getTemplate).toHaveBeenCalled();
        expect(this.plugin.getTemplate.calls.count()).toEqual(1);

    });

    it('stage plugin getModelValue', function() {

        this.plugin.getModelValue("x");
        expect(this.plugin.getModelValue).toHaveBeenCalled();
        expect(this.plugin.getModelValue.calls.count()).toEqual(1);

    });
    it('stage plugin setModelValue', function() {

        this.plugin.setModelValue("x");
        expect(this.plugin.setModelValue).toHaveBeenCalled();
        expect(this.plugin.setModelValue.calls.count()).toEqual(1);

    });


    it('stage plugin setParam', function() {

        this.plugin.setParam("x", 10, 10, 20);
        expect(this.plugin.setParam).toHaveBeenCalled();
        expect(this.plugin.setParam.calls.count()).toEqual(1);

    });

    it('stage plugin getParam', function() {

        this.plugin.getParam("x");
        expect(this.plugin.getParam).toHaveBeenCalled();
        expect(this.plugin.getParam.calls.count()).toEqual(1);

    });

});