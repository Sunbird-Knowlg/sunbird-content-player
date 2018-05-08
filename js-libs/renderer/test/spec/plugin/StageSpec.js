describe('Stage Plugin test cases', function() {

    beforeEach(function(done) {
        this.plugin = org.ekstep.pluginframework.pluginManager.pluginInstances["stage1"];
        spyOn(this.plugin, 'initPlugin').and.callThrough();
        spyOn(this.plugin, 'setParamValue').and.callThrough();
        spyOn(this.plugin, 'addController').and.callThrough();
        spyOn(this.plugin, 'getController').and.callThrough();
        spyOn(this.plugin, 'getTemplate').and.callThrough();
        spyOn(this.plugin, 'getModelValue').and.callThrough();
        spyOn(this.plugin, 'setModelValue').and.callThrough();
        spyOn(this.plugin, 'evaluate').and.callThrough();
        spyOn(this.plugin, 'reload').and.callThrough();
        spyOn(this.plugin, 'setParam').and.callThrough();
        spyOn(this.plugin, 'getParam').and.callThrough();
        done();
    });

    it('Stage plugin initPlugin', function() {
        expect(true).toEqual(this.plugin._self instanceof creatine.Scene);
        this.plugin.initPlugin({
            primary: true
        });
        expect(this.plugin.initPlugin).toHaveBeenCalled();
        expect(this.plugin.initPlugin.calls.count()).toEqual(1);
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
        this.plugin.addController( {'ev-if':"stage.param2 "});
        expect(this.plugin.addController).toHaveBeenCalled();
        expect(this.plugin.addController.calls.count()).toEqual(1);
    });

    it('stage plugin getController', function() {
        this.plugin.getController();
        expect(this.plugin.getController).toHaveBeenCalled();
        expect(this.plugin.getController.calls.count()).toEqual(1);
    });

    it('stage plugin getTemplate', function() {
        this.plugin.getTemplate();
        expect(this.plugin.getTemplate).toHaveBeenCalled();
        expect(this.plugin.getTemplate.calls.count()).toEqual(1);
    });

    it('stage plugin getModelValue', function() {
        this.plugin.getModelValue();
        expect(this.plugin.getModelValue).toHaveBeenCalled();
        expect(this.plugin.getModelValue.calls.count()).toEqual(1);
    });

    it('stage plugin setModelValue', function() {
        this.plugin.setModelValue();
        expect(this.plugin.setModelValue).toHaveBeenCalled();
        expect(this.plugin.setModelValue.calls.count()).toEqual(1);
    });

    it('stage plugin evaluate', function() {
        this.plugin.evaluate({failure : "next_item"});
        expect(this.plugin.evaluate).toHaveBeenCalled();
        expect(this.plugin.evaluate.calls.count()).toEqual(1);
    });

    it('stage plugin reload', function() { 
        this.plugin.reload();
        expect(this.plugin.reload).toHaveBeenCalled();
        expect(this.plugin.reload.calls.count()).toEqual(1);
    });

    it('stage plugin setParam', function() {
        this.plugin.setParam("x", 10, 10, 20);
        expect(this.plugin.setParam).toHaveBeenCalled();
        expect(this.plugin.setParam.calls.count()).toEqual(1);
    });

    it('stage plugin getParam', function() {
        this.plugin.getParam(['param-name']);
        expect(this.plugin.getParam).toHaveBeenCalled();
        expect(this.plugin.getParam.calls.count()).toEqual(1);
    });

});